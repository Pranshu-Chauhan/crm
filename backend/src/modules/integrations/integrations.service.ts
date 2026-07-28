import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { createCipheriv, createDecipheriv, createHmac, randomBytes, scryptSync } from 'crypto';
import { ActivityType, LeadSource, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SaveApifyHousingDto } from './dto/save-apify-housing.dto';
import { SaveHousingComDto } from './dto/save-housing-com.dto';

type ApifyRun = { id: string; status: string; defaultDatasetId?: string };
type ActorRecord = Record<string, unknown>;
type HousingLeadRecord = {
  lead_name?: string;
  lead_phone?: string;
  lead_email?: string | null;
  project_id?: number;
  project_name?: string;
  locality?: string;
  lead_date?: string | number;
};

@Injectable()
export class IntegrationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getApifyHousing(tenantId: string) {
    const integration = await this.prisma.apifyHousingIntegration.findUnique({ where: { tenantId } });
    if (!integration) return { connected: false };

    return {
      connected: true,
      actorId: integration.actorId,
      actorInput: integration.actorInput,
      lastImportedAt: integration.lastImportedAt,
      lastRunId: integration.lastRunId,
    };
  }

  async saveApifyHousing(tenantId: string, dto: SaveApifyHousingDto) {
    const existing = await this.prisma.apifyHousingIntegration.findUnique({ where: { tenantId } });
    if (!existing && !dto.token) {
      throw new BadRequestException('An Apify API token is required when connecting for the first time.');
    }

    const tokenCiphertext = dto.token ? this.encrypt(dto.token) : undefined;
    const integration = await this.prisma.apifyHousingIntegration.upsert({
      where: { tenantId },
      create: {
        tenantId,
        actorId: dto.actorId,
        tokenCiphertext: tokenCiphertext!,
        actorInput: (dto.actorInput ?? {}) as Prisma.InputJsonValue,
      },
      update: {
        actorId: dto.actorId,
        ...(tokenCiphertext ? { tokenCiphertext } : {}),
        ...(dto.actorInput !== undefined ? { actorInput: dto.actorInput as Prisma.InputJsonValue } : {}),
      },
    });

    return { connected: true, actorId: integration.actorId, actorInput: integration.actorInput };
  }

  async testImportApifyHousing(tenantId: string, userId: string) {
    const integration = await this.prisma.apifyHousingIntegration.findUnique({ where: { tenantId } });
    if (!integration) throw new NotFoundException('Connect an Apify actor before running a test import.');

    const token = this.decrypt(integration.tokenCiphertext);
    const startedRun = await this.startActor(integration.actorId, token, integration.actorInput as Record<string, unknown>);
    const run = await this.waitForActorRun(startedRun, token);
    if (run.status !== 'SUCCEEDED' || !run.defaultDatasetId) {
      throw new BadGatewayException(`Apify actor did not finish successfully (status: ${run.status}).`);
    }

    const records = await this.getDatasetItems(run.defaultDatasetId, token);
    let imported = 0;
    let duplicates = 0;
    let skipped = 0;

    for (const record of records) {
      const lead = this.toLead(record);
      if (!lead) {
        skipped++;
        continue;
      }

      const duplicate = await this.prisma.lead.findFirst({
        where: lead.externalId
          ? { tenantId, source: LeadSource.HOUSING_COM, externalId: lead.externalId }
          : { tenantId, source: LeadSource.HOUSING_COM, phone: lead.phone },
        select: { id: true },
      });
      if (duplicate) {
        duplicates++;
        continue;
      }

      const created = await this.prisma.lead.create({
        data: { ...lead, tenantId, createdById: userId, source: LeadSource.HOUSING_COM, importedAt: new Date() },
      });
      await this.prisma.activity.create({
        data: {
          tenantId,
          leadId: created.id,
          userId,
          type: ActivityType.LEAD_IMPORTED,
          title: 'Lead imported from Apify',
          description: `Imported from Apify actor ${integration.actorId}`,
          metadata: { source: 'Housing.com via Apify', runId: run.id, externalId: lead.externalId },
        },
      });
      imported++;
    }

    await this.prisma.apifyHousingIntegration.update({
      where: { tenantId },
      data: { lastImportedAt: new Date(), lastRunId: run.id },
    });

    return { runId: run.id, recordsFetched: records.length, imported, duplicates, skipped };
  }

  async getHousingCom(tenantId: string) {
    const integration = await this.prisma.housingComIntegration.findUnique({ where: { tenantId } });
    if (!integration) return { connected: false };

    return {
      connected: true,
      housingId: integration.housingId,
      lastImportedAt: integration.lastImportedAt,
      lastFetchedUntil: integration.lastFetchedUntil,
    };
  }

  async saveHousingCom(tenantId: string, dto: SaveHousingComDto) {
    const existing = await this.prisma.housingComIntegration.findUnique({ where: { tenantId } });
    if (!existing && !dto.secretKey) {
      throw new BadRequestException('A Housing.com secret key is required when connecting for the first time.');
    }

    const secretKeyCiphertext = dto.secretKey ? this.encrypt(dto.secretKey) : undefined;
    const integration = await this.prisma.housingComIntegration.upsert({
      where: { tenantId },
      create: {
        tenantId,
        housingId: dto.housingId.trim(),
        secretKeyCiphertext: secretKeyCiphertext!,
      },
      update: {
        housingId: dto.housingId.trim(),
        ...(secretKeyCiphertext ? { secretKeyCiphertext } : {}),
      },
    });

    return { connected: true, housingId: integration.housingId };
  }

  async fetchHousingComLeads(tenantId: string, userId: string, daysBack = 90) {
    const integration = await this.prisma.housingComIntegration.findUnique({ where: { tenantId } });
    if (!integration) throw new NotFoundException('Connect your Housing.com credentials before fetching leads.');

    const secretKey = this.decrypt(integration.secretKeyCiphertext);
    const endDate = new Date();
    const startDate = integration.lastFetchedUntil
      ? new Date(integration.lastFetchedUntil.getTime() - 24 * 60 * 60 * 1000)
      : new Date(endDate.getTime() - daysBack * 24 * 60 * 60 * 1000);

    const records = await this.fetchHousingLeadsFromApi(integration.housingId, secretKey, startDate, endDate);
    let imported = 0;
    let duplicates = 0;
    let skipped = 0;

    for (const record of records) {
      const lead = this.housingRecordToLead(record);
      if (!lead) {
        skipped++;
        continue;
      }

      const duplicate = await this.prisma.lead.findFirst({
        where: lead.externalId
          ? { tenantId, source: LeadSource.HOUSING_COM, externalId: lead.externalId }
          : { tenantId, source: LeadSource.HOUSING_COM, phone: lead.phone },
        select: { id: true },
      });
      if (duplicate) {
        duplicates++;
        continue;
      }

      const created = await this.prisma.lead.create({
        data: { ...lead, tenantId, createdById: userId, source: LeadSource.HOUSING_COM, importedAt: new Date() },
      });
      await this.prisma.activity.create({
        data: {
          tenantId,
          leadId: created.id,
          userId,
          type: ActivityType.LEAD_IMPORTED,
          title: 'Lead imported from Housing.com',
          description: `Imported from Housing.com project ${record.project_name || 'Unknown'}`,
          metadata: { source: 'Housing.com', externalId: lead.externalId, projectId: record.project_id },
        },
      });
      imported++;
    }

    await this.prisma.housingComIntegration.update({
      where: { tenantId },
      data: { lastImportedAt: new Date(), lastFetchedUntil: endDate },
    });

    return { recordsFetched: records.length, imported, duplicates, skipped, fetchedFrom: startDate, fetchedTo: endDate };
  }

  private async fetchHousingLeadsFromApi(housingId: string, secretKey: string, startDate: Date, endDate: Date) {
    const currentTime = Math.floor(Date.now() / 1000).toString();
    const hash = createHmac('sha256', secretKey).update(currentTime).digest('hex');
    const params = new URLSearchParams({
      id: housingId,
      current_time: currentTime,
      start_date: Math.floor(startDate.getTime() / 1000).toString(),
      end_date: Math.floor(endDate.getTime() / 1000).toString(),
      hash,
    });

    let response: Response;
    try {
      response = await fetch(`https://leads.housing.com/api/v0/get-builder-leads?${params.toString()}`);
    } catch {
      throw new BadGatewayException('Unable to reach Housing.com lead servers. Check your network connection and try again.');
    }

    const payload = await response.json().catch(() => null);
    if (response.status === 401) {
      throw new BadGatewayException('Housing.com rejected the request. Check your Housing ID and secret key.');
    }
    if (!response.ok) {
      const message = payload?.message || payload?.error || `Housing.com request failed with HTTP ${response.status}.`;
      throw new BadGatewayException(message);
    }

    if (Array.isArray(payload)) return payload as HousingLeadRecord[];
    if (Array.isArray(payload?.leads)) return payload.leads as HousingLeadRecord[];
    if (Array.isArray(payload?.data)) return payload.data as HousingLeadRecord[];
    return [];
  }

  private housingRecordToLead(record: HousingLeadRecord) {
    const phone = record.lead_phone?.replace(/[^\d+]/g, '');
    if (!phone) return null;

    const fullName = record.lead_name?.trim() || 'Housing Enquiry';
    const [firstName, ...lastName] = fullName.split(/\s+/);
    const leadDate = record.lead_date ? String(record.lead_date) : '';
    const externalId = record.project_id && leadDate ? `${record.project_id}-${leadDate}-${phone}` : `${phone}-${leadDate || 'unknown'}`;

    const notes = [
      record.project_name ? `Project: ${record.project_name}` : null,
      record.locality ? `Locality: ${record.locality}` : null,
      record.project_id ? `Project ID: ${record.project_id}` : null,
    ].filter(Boolean).join('\n');

    return {
      firstName,
      lastName: lastName.join(' ') || 'Lead',
      phone,
      email: record.lead_email || undefined,
      preferredLocality: record.locality,
      notes: notes || undefined,
      externalId,
      tags: ['housing-import'],
    };
  }

  private async startActor(actorId: string, token: string, input: Record<string, unknown>): Promise<ApifyRun> {
    const response = await this.fetchApify(`https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/runs`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const payload = await this.readApifyResponse(response);
    return payload.data as ApifyRun;
  }

  private async waitForActorRun(run: ApifyRun, token: string): Promise<ApifyRun> {
    let currentRun = run;
    const completedStates = new Set(['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT']);

    // A newly-created Apify run normally starts as READY, then becomes RUNNING.
    // Poll instead of treating that expected intermediate state as a failure.
    // Housing.com browser actors can take several minutes to launch Chromium and crawl a page.
    for (let attempt = 0; attempt < 120; attempt++) {
      if (completedStates.has(currentRun.status)) return currentRun;
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const response = await this.fetchApify(`https://api.apify.com/v2/actor-runs/${encodeURIComponent(currentRun.id)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await this.readApifyResponse(response);
      currentRun = payload.data as ApifyRun;
    }

    return currentRun;
  }

  private async getDatasetItems(datasetId: string, token: string): Promise<ActorRecord[]> {
    const response = await this.fetchApify(`https://api.apify.com/v2/datasets/${encodeURIComponent(datasetId)}/items?clean=true`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const payload = await this.readApifyResponse(response);
    return Array.isArray(payload) ? payload as ActorRecord[] : [];
  }

  private async readApifyResponse(response: Response): Promise<any> {
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message = payload?.error?.message || `Apify request failed with HTTP ${response.status}.`;
      throw new BadGatewayException(message);
    }
    return payload;
  }

  private async fetchApify(url: string, init: RequestInit) {
    try {
      return await fetch(url, init);
    } catch {
      throw new BadGatewayException(
        'Unable to reach api.apify.com. Check this machine’s internet/DNS connection, firewall, or proxy settings and try again.',
      );
    }
  }

  private toLead(record: ActorRecord) {
    const value = (...keys: string[]) => keys.map((key) => record[key]).find((item) => typeof item === 'string' && item.trim()) as string | undefined;
    const phone = value('phone', 'phoneNumber', 'mobile', 'mobileNumber', 'lead_phone', 'contactPhone');
    if (!phone) return null;

    const fullName = value('lead_name', 'leadName', 'name', 'contactName', 'ownerName') || 'Housing Enquiry';
    const [firstName, ...lastName] = fullName.trim().split(/\s+/);
    return {
      firstName,
      lastName: lastName.join(' ') || 'Lead',
      phone: phone.replace(/[^\d+]/g, ''),
      email: value('email', 'emailAddress', 'lead_email'),
      preferredCity: value('city', 'locationCity'),
      preferredLocality: value('locality', 'area', 'location'),
      notes: value('description', 'message', 'project_name', 'projectName', 'title'),
      externalId: value('id', 'lead_id', 'leadId', 'url', 'propertyUrl'),
      tags: ['housing-import', 'apify'],
    };
  }

  private encryptionKey() {
    const secret = process.env.INTEGRATION_ENCRYPTION_KEY;
    if (!secret) throw new BadRequestException('INTEGRATION_ENCRYPTION_KEY must be configured before saving Apify credentials.');
    return scryptSync(secret, 'skyline-crm-apify', 32);
  }

  private encrypt(value: string) {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey(), iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    return `${iv.toString('base64')}:${cipher.getAuthTag().toString('base64')}:${encrypted.toString('base64')}`;
  }

  private decrypt(value: string) {
    const [ivValue, tagValue, encryptedValue] = value.split(':');
    if (!ivValue || !tagValue || !encryptedValue) throw new BadRequestException('Saved Apify credentials are invalid. Reconnect the integration.');
    const decipher = createDecipheriv('aes-256-gcm', this.encryptionKey(), Buffer.from(ivValue, 'base64'));
    decipher.setAuthTag(Buffer.from(tagValue, 'base64'));
    return Buffer.concat([decipher.update(Buffer.from(encryptedValue, 'base64')), decipher.final()]).toString('utf8');
  }
}
