import crypto from 'crypto';
import { getPool } from '../pool.js';
import { withUserTransaction } from '../withUserTransaction.js';
import {
  Farm,
  CreateFarm,
  UpdateFarm,
  Field,
  CreateField,
  UpdateField,
  SoilReading,
  CreateSoilReading,
  DiseaseAssessmentRecord,
  WeatherSnapshot,
  CropRecommendationResult,
  Conversation,
  ConversationMessage,
  AlertPreferences,
  HistoryItem,
  HistoryResponse,
  AccountDataExport
} from '@farmguard/shared';

// Development In-Memory Store partitioned by userId
interface UserStore {
  farms: Map<string, Farm>;
  fields: Map<string, Field>;
  soilReadings: Map<string, SoilReading>;
  diseaseAssessments: Map<string, DiseaseAssessmentRecord>;
  weatherSnapshots: Map<string, WeatherSnapshot>;
  recommendations: Map<string, CropRecommendationResult>;
  conversations: Map<string, Conversation>;
  messages: Map<string, ConversationMessage>;
  alertPreferences: Map<string, AlertPreferences>;
}

const memoryStores = new Map<string, UserStore>();

function getUserStore(userId: string): UserStore {
  let store = memoryStores.get(userId);
  if (!store) {
    store = {
      farms: new Map(),
      fields: new Map(),
      soilReadings: new Map(),
      diseaseAssessments: new Map(),
      weatherSnapshots: new Map(),
      recommendations: new Map(),
      conversations: new Map(),
      messages: new Map(),
      alertPreferences: new Map(),
    };
    memoryStores.set(userId, store);

    // Pre-populate realistic seed data for the demo farmer
    if (userId === '00000000-0000-0000-0000-000000000001') {
      const farmId = '11111111-1111-1111-1111-111111111111';
      const farm: Farm = {
        id: farmId,
        ownerId: userId,
        name: 'Sri Venkateswara Farm (శ్రీ వెంకటేశ్వర క్షేత్రం)',
        countryCode: 'IN',
        state: 'Telangana',
        district: 'Siddipet',
        locality: 'Gajwel',
        latitude: 17.8524,
        longitude: 78.6833,
        locationSource: 'manual',
        timezone: 'Asia/Kolkata',
        notes: 'Main agricultural holding with canal and borewell irrigation.',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.farms.set(farmId, farm);

      const field1Id = '22222222-2222-2222-2222-222222222221';
      const field1: Field = {
        id: field1Id,
        ownerId: userId,
        farmId,
        name: 'North Wet Field (వరి చేను - ఉత్తర మడి)',
        areaValue: 3.5,
        areaUnit: 'acre',
        soilType: 'Clay loam',
        currentCropCode: 'rice',
        plantingDate: '2024-07-15',
        irrigationType: 'Borewell canal flood',
        notes: 'Level land suitable for continuous submergence.',
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.fields.set(field1Id, field1);

      const field2Id = '22222222-2222-2222-2222-222222222222';
      const field2: Field = {
        id: field2Id,
        ownerId: userId,
        farmId,
        name: 'South Black Soil Field (పత్తి చేను - నల్లరేగడి)',
        areaValue: 4.0,
        areaUnit: 'acre',
        soilType: 'Deep black cotton soil',
        currentCropCode: 'cotton',
        plantingDate: '2024-06-25',
        irrigationType: 'Drip system',
        notes: 'High drainage capability required.',
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
      };
      store.fields.set(field2Id, field2);

      // Seed soil readings
      const reading1Id = crypto.randomUUID();
      store.soilReadings.set(reading1Id, {
        id: reading1Id,
        ownerId: userId,
        fieldId: field1Id,
        observedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        moisturePct: 62.5,
        temperatureC: 27.2,
        ph: 6.8,
        nitrogenValue: 140.0,
        phosphorusValue: 22.5,
        potassiumValue: 180.0,
        npkUnit: 'kg_per_ha',
        source: 'manual',
        notes: 'Post-transplanting soil check.',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      });

      const reading2Id = crypto.randomUUID();
      store.soilReadings.set(reading2Id, {
        id: reading2Id,
        ownerId: userId,
        fieldId: field2Id,
        observedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        moisturePct: 41.0,
        temperatureC: 29.5,
        ph: 7.4,
        nitrogenValue: 95.0,
        phosphorusValue: 18.0,
        potassiumValue: 240.0,
        npkUnit: 'kg_per_ha',
        source: 'sensor',
        notes: 'Telemetry IoT probe 01 reading.',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      });

      // Seed alert preferences
      store.alertPreferences.set(farmId, {
        id: crypto.randomUUID(),
        ownerId: userId,
        farmId,
        enabled: true,
        channels: { inApp: true, sms: false, email: false },
        thresholds: { heavyRainMm: 25, extremeHeatC: 38, frostC: 4, highWindKmh: 35 },
        updatedAt: new Date().toISOString(),
      });
    }
  }
  return store;
}

export class DataRepository {
  // ================= FARMS =================
  async getFarms(userId: string): Promise<Farm[]> {
    const pool = getPool();
    if (!pool) {
      return Array.from(getUserStore(userId).farms.values()).sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    }

    return await withUserTransaction(userId, async (client) => {
      const res = await client.query('SELECT * FROM farms ORDER BY updated_at DESC');
      return res.rows.map((r) => ({
        id: r.id,
        ownerId: r.owner_id,
        name: r.name,
        countryCode: r.country_code,
        state: r.state,
        district: r.district,
        locality: r.locality,
        latitude: r.latitude,
        longitude: r.longitude,
        locationSource: r.location_source,
        timezone: r.timezone,
        notes: r.notes,
        createdAt: r.created_at.toISOString(),
        updatedAt: r.updated_at.toISOString(),
      }));
    });
  }

  async getFarmById(userId: string, farmId: string): Promise<Farm | null> {
    const pool = getPool();
    if (!pool) {
      return getUserStore(userId).farms.get(farmId) || null;
    }

    return await withUserTransaction(userId, async (client) => {
      const res = await client.query('SELECT * FROM farms WHERE id = $1', [farmId]);
      if (res.rows.length === 0) return null;
      const r = res.rows[0];
      return {
        id: r.id,
        ownerId: r.owner_id,
        name: r.name,
        countryCode: r.country_code,
        state: r.state,
        district: r.district,
        locality: r.locality,
        latitude: r.latitude,
        longitude: r.longitude,
        locationSource: r.location_source,
        timezone: r.timezone,
        notes: r.notes,
        createdAt: r.created_at.toISOString(),
        updatedAt: r.updated_at.toISOString(),
      };
    });
  }

  async createFarm(userId: string, data: CreateFarm): Promise<Farm> {
    const pool = getPool();
    const now = new Date().toISOString();

    if (!pool) {
      const farmId = crypto.randomUUID();
      const farm: Farm = {
        id: farmId,
        ownerId: userId,
        name: data.name,
        countryCode: data.countryCode || 'IN',
        state: data.state,
        district: data.district,
        locality: data.locality || null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        locationSource: data.locationSource || null,
        timezone: data.timezone || 'Asia/Kolkata',
        notes: data.notes || null,
        createdAt: now,
        updatedAt: now,
      };
      getUserStore(userId).farms.set(farmId, farm);
      return farm;
    }

    return await withUserTransaction(userId, async (client) => {
      const res = await client.query(
        `INSERT INTO farms (owner_id, name, country_code, state, district, locality, latitude, longitude, location_source, timezone, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [
          userId,
          data.name,
          data.countryCode || 'IN',
          data.state,
          data.district,
          data.locality || null,
          data.latitude ?? null,
          data.longitude ?? null,
          data.locationSource || null,
          data.timezone || 'Asia/Kolkata',
          data.notes || null,
        ]
      );
      const r = res.rows[0];
      return {
        id: r.id,
        ownerId: r.owner_id,
        name: r.name,
        countryCode: r.country_code,
        state: r.state,
        district: r.district,
        locality: r.locality,
        latitude: r.latitude,
        longitude: r.longitude,
        locationSource: r.location_source,
        timezone: r.timezone,
        notes: r.notes,
        createdAt: r.created_at.toISOString(),
        updatedAt: r.updated_at.toISOString(),
      };
    });
  }

  async updateFarm(userId: string, farmId: string, data: UpdateFarm): Promise<Farm | null> {
    const pool = getPool();
    if (!pool) {
      const store = getUserStore(userId);
      const farm = store.farms.get(farmId);
      if (!farm) return null;
      Object.assign(farm, data, { updatedAt: new Date().toISOString() });
      return farm;
    }

    return await withUserTransaction(userId, async (client) => {
      const existing = await client.query('SELECT * FROM farms WHERE id = $1', [farmId]);
      if (existing.rows.length === 0) return null;

      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;

      for (const [key, val] of Object.entries(data)) {
        if (val !== undefined) {
          const col = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
          fields.push(`${col} = $${idx++}`);
          values.push(val);
        }
      }

      if (fields.length === 0) return this.getFarmById(userId, farmId);

      values.push(farmId);
      const query = `UPDATE farms SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
      const res = await client.query(query, values);
      const r = res.rows[0];
      return {
        id: r.id,
        ownerId: r.owner_id,
        name: r.name,
        countryCode: r.country_code,
        state: r.state,
        district: r.district,
        locality: r.locality,
        latitude: r.latitude,
        longitude: r.longitude,
        locationSource: r.location_source,
        timezone: r.timezone,
        notes: r.notes,
        createdAt: r.created_at.toISOString(),
        updatedAt: r.updated_at.toISOString(),
      };
    });
  }

  async deleteFarm(userId: string, farmId: string): Promise<boolean> {
    const pool = getPool();
    if (!pool) {
      const store = getUserStore(userId);
      return store.farms.delete(farmId);
    }

    return await withUserTransaction(userId, async (client) => {
      const res = await client.query('DELETE FROM farms WHERE id = $1', [farmId]);
      return (res.rowCount ?? 0) > 0;
    });
  }

  // ================= FIELDS =================
  async getFields(userId: string, farmId?: string): Promise<Field[]> {
    const pool = getPool();
    if (!pool) {
      const all = Array.from(getUserStore(userId).fields.values());
      return farmId ? all.filter((f) => f.farmId === farmId) : all;
    }

    return await withUserTransaction(userId, async (client) => {
      const query = farmId
        ? 'SELECT * FROM fields WHERE farm_id = $1 ORDER BY created_at ASC'
        : 'SELECT * FROM fields ORDER BY created_at ASC';
      const params = farmId ? [farmId] : [];
      const res = await client.query(query, params);
      return res.rows.map((r) => ({
        id: r.id,
        ownerId: r.owner_id,
        farmId: r.farm_id,
        name: r.name,
        areaValue: r.area_value ? Number(r.area_value) : null,
        areaUnit: r.area_unit,
        soilType: r.soil_type,
        currentCropCode: r.current_crop_code,
        plantingDate: r.planting_date ? r.planting_date.toISOString().split('T')[0] : null,
        irrigationType: r.irrigation_type,
        notes: r.notes,
        createdAt: r.created_at.toISOString(),
        updatedAt: r.updated_at.toISOString(),
      }));
    });
  }

  async getFieldById(userId: string, fieldId: string): Promise<Field | null> {
    const pool = getPool();
    if (!pool) {
      return getUserStore(userId).fields.get(fieldId) || null;
    }

    return await withUserTransaction(userId, async (client) => {
      const res = await client.query('SELECT * FROM fields WHERE id = $1', [fieldId]);
      if (res.rows.length === 0) return null;
      const r = res.rows[0];
      return {
        id: r.id,
        ownerId: r.owner_id,
        farmId: r.farm_id,
        name: r.name,
        areaValue: r.area_value ? Number(r.area_value) : null,
        areaUnit: r.area_unit,
        soilType: r.soil_type,
        currentCropCode: r.current_crop_code,
        plantingDate: r.planting_date ? r.planting_date.toISOString().split('T')[0] : null,
        irrigationType: r.irrigation_type,
        notes: r.notes,
        createdAt: r.created_at.toISOString(),
        updatedAt: r.updated_at.toISOString(),
      };
    });
  }

  async createField(userId: string, farmId: string, data: CreateField): Promise<Field> {
    const farm = await this.getFarmById(userId, farmId);
    if (!farm) {
      throw new Error('Farm not found or unauthorized.');
    }

    const pool = getPool();
    const now = new Date().toISOString();

    if (!pool) {
      const fieldId = crypto.randomUUID();
      const field: Field = {
        id: fieldId,
        ownerId: userId,
        farmId,
        name: data.name,
        areaValue: data.areaValue ?? null,
        areaUnit: data.areaUnit || 'acre',
        soilType: data.soilType || null,
        currentCropCode: data.currentCropCode || null,
        plantingDate: data.plantingDate || null,
        irrigationType: data.irrigationType || null,
        notes: data.notes || null,
        createdAt: now,
        updatedAt: now,
      };
      getUserStore(userId).fields.set(fieldId, field);
      return field;
    }

    return await withUserTransaction(userId, async (client) => {
      const res = await client.query(
        `INSERT INTO fields (owner_id, farm_id, name, area_value, area_unit, soil_type, current_crop_code, planting_date, irrigation_type, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          userId,
          farmId,
          data.name,
          data.areaValue ?? null,
          data.areaUnit || 'acre',
          data.soilType || null,
          data.currentCropCode || null,
          data.plantingDate || null,
          data.irrigationType || null,
          data.notes || null,
        ]
      );
      const r = res.rows[0];
      return {
        id: r.id,
        ownerId: r.owner_id,
        farmId: r.farm_id,
        name: r.name,
        areaValue: r.area_value ? Number(r.area_value) : null,
        areaUnit: r.area_unit,
        soilType: r.soil_type,
        currentCropCode: r.current_crop_code,
        plantingDate: r.planting_date ? r.planting_date.toISOString().split('T')[0] : null,
        irrigationType: r.irrigation_type,
        notes: r.notes,
        createdAt: r.created_at.toISOString(),
        updatedAt: r.updated_at.toISOString(),
      };
    });
  }

  async updateField(userId: string, fieldId: string, data: UpdateField): Promise<Field | null> {
    const pool = getPool();
    if (!pool) {
      const store = getUserStore(userId);
      const field = store.fields.get(fieldId);
      if (!field) return null;
      Object.assign(field, data, { updatedAt: new Date().toISOString() });
      return field;
    }

    return await withUserTransaction(userId, async (client) => {
      const existing = await client.query('SELECT * FROM fields WHERE id = $1', [fieldId]);
      if (existing.rows.length === 0) return null;

      const fields: string[] = [];
      const values: any[] = [];
      let idx = 1;

      for (const [key, val] of Object.entries(data)) {
        if (val !== undefined) {
          const col = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
          fields.push(`${col} = $${idx++}`);
          values.push(val);
        }
      }

      if (fields.length === 0) return this.getFieldById(userId, fieldId);

      values.push(fieldId);
      const query = `UPDATE fields SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
      const res = await client.query(query, values);
      const r = res.rows[0];
      return {
        id: r.id,
        ownerId: r.owner_id,
        farmId: r.farm_id,
        name: r.name,
        areaValue: r.area_value ? Number(r.area_value) : null,
        areaUnit: r.area_unit,
        soilType: r.soil_type,
        currentCropCode: r.current_crop_code,
        plantingDate: r.planting_date ? r.planting_date.toISOString().split('T')[0] : null,
        irrigationType: r.irrigation_type,
        notes: r.notes,
        createdAt: r.created_at.toISOString(),
        updatedAt: r.updated_at.toISOString(),
      };
    });
  }

  async deleteField(userId: string, fieldId: string): Promise<boolean> {
    const pool = getPool();
    if (!pool) {
      return getUserStore(userId).fields.delete(fieldId);
    }

    return await withUserTransaction(userId, async (client) => {
      const res = await client.query('DELETE FROM fields WHERE id = $1', [fieldId]);
      return (res.rowCount ?? 0) > 0;
    });
  }

  // ================= SOIL READINGS =================
  async getSoilReadings(userId: string, fieldId?: string): Promise<SoilReading[]> {
    const pool = getPool();
    if (!pool) {
      const all = Array.from(getUserStore(userId).soilReadings.values());
      const filtered = fieldId ? all.filter((r) => r.fieldId === fieldId) : all;
      return filtered.sort((a, b) => new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime());
    }

    return await withUserTransaction(userId, async (client) => {
      const query = fieldId
        ? 'SELECT * FROM soil_readings WHERE field_id = $1 ORDER BY observed_at DESC'
        : 'SELECT * FROM soil_readings ORDER BY observed_at DESC';
      const params = fieldId ? [fieldId] : [];
      const res = await client.query(query, params);
      return res.rows.map((r) => ({
        id: r.id,
        ownerId: r.owner_id,
        fieldId: r.field_id,
        observedAt: r.observed_at.toISOString(),
        moisturePct: r.moisture_pct ? Number(r.moisture_pct) : null,
        temperatureC: r.temperature_c ? Number(r.temperature_c) : null,
        ph: r.ph ? Number(r.ph) : null,
        nitrogenValue: r.nitrogen_value ? Number(r.nitrogen_value) : null,
        phosphorusValue: r.phosphorus_value ? Number(r.phosphorus_value) : null,
        potassiumValue: r.potassium_value ? Number(r.potassium_value) : null,
        npkUnit: r.npk_unit,
        source: r.source,
        notes: r.notes,
        createdAt: r.created_at.toISOString(),
      }));
    });
  }

  async createSoilReading(userId: string, fieldId: string, data: CreateSoilReading): Promise<SoilReading> {
    const field = await this.getFieldById(userId, fieldId);
    if (!field) {
      throw new Error('Field not found or unauthorized.');
    }

    const pool = getPool();
    const observedAt = data.observedAt || new Date().toISOString();
    const now = new Date().toISOString();

    if (!pool) {
      const readingId = crypto.randomUUID();
      const reading: SoilReading = {
        id: readingId,
        ownerId: userId,
        fieldId,
        observedAt,
        moisturePct: data.moisturePct ?? null,
        temperatureC: data.temperatureC ?? null,
        ph: data.ph ?? null,
        nitrogenValue: data.nitrogenValue ?? null,
        phosphorusValue: data.phosphorusValue ?? null,
        potassiumValue: data.potassiumValue ?? null,
        npkUnit: data.npkUnit || 'kg_per_ha',
        source: data.source || 'manual',
        notes: data.notes || null,
        createdAt: now,
      };
      getUserStore(userId).soilReadings.set(readingId, reading);
      return reading;
    }

    return await withUserTransaction(userId, async (client) => {
      const res = await client.query(
        `INSERT INTO soil_readings (owner_id, field_id, observed_at, moisture_pct, temperature_c, ph, nitrogen_value, phosphorus_value, potassium_value, npk_unit, source, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          userId,
          fieldId,
          observedAt,
          data.moisturePct ?? null,
          data.temperatureC ?? null,
          data.ph ?? null,
          data.nitrogenValue ?? null,
          data.phosphorusValue ?? null,
          data.potassiumValue ?? null,
          data.npkUnit || 'kg_per_ha',
          data.source || 'manual',
          data.notes || null,
        ]
      );
      const r = res.rows[0];
      return {
        id: r.id,
        ownerId: r.owner_id,
        fieldId: r.field_id,
        observedAt: r.observed_at.toISOString(),
        moisturePct: r.moisture_pct ? Number(r.moisture_pct) : null,
        temperatureC: r.temperature_c ? Number(r.temperature_c) : null,
        ph: r.ph ? Number(r.ph) : null,
        nitrogenValue: r.nitrogen_value ? Number(r.nitrogen_value) : null,
        phosphorusValue: r.phosphorus_value ? Number(r.phosphorus_value) : null,
        potassiumValue: r.potassium_value ? Number(r.potassium_value) : null,
        npkUnit: r.npk_unit,
        source: r.source,
        notes: r.notes,
        createdAt: r.created_at.toISOString(),
      };
    });
  }

  async deleteSoilReading(userId: string, readingId: string): Promise<boolean> {
    const pool = getPool();
    if (!pool) {
      return getUserStore(userId).soilReadings.delete(readingId);
    }

    return await withUserTransaction(userId, async (client) => {
      const res = await client.query('DELETE FROM soil_readings WHERE id = $1', [readingId]);
      return (res.rowCount ?? 0) > 0;
    });
  }

  // ================= DISEASE ASSESSMENTS =================
  async saveDiseaseAssessment(userId: string, record: DiseaseAssessmentRecord): Promise<DiseaseAssessmentRecord> {
    const pool = getPool();
    if (!pool) {
      getUserStore(userId).diseaseAssessments.set(record.id, record);
      return record;
    }

    return await withUserTransaction(userId, async (client) => {
      const res = await client.query(
        `INSERT INTO disease_assessments (id, owner_id, field_id, crop_code, storage_key, image_sha256, predicted_class, confidence, status, class_probabilities, next_steps, model_version)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          record.id,
          userId,
          record.fieldId || null,
          record.cropCode || null,
          record.storageKey,
          record.imageSha256,
          record.predictedClass || null,
          record.confidence ?? null,
          record.status,
          JSON.stringify(record.classProbabilities || []),
          JSON.stringify(record.nextSteps || []),
          record.modelVersion || null,
        ]
      );
      const r = res.rows[0];
      return {
        id: r.id,
        ownerId: r.owner_id,
        fieldId: r.field_id,
        cropCode: r.crop_code,
        storageKey: r.storage_key,
        imageSha256: r.image_sha256,
        predictedClass: r.predicted_class,
        confidence: r.confidence ? Number(r.confidence) : null,
        status: r.status,
        abstentionReason: r.abstention_reason || null,
        classProbabilities: r.class_probabilities,
        nextSteps: r.next_steps,
        modelVersion: r.model_version,
        createdAt: r.created_at.toISOString(),
        deletedAt: r.deleted_at ? r.deleted_at.toISOString() : null,
      };
    });
  }

  async getDiseaseAssessments(userId: string): Promise<DiseaseAssessmentRecord[]> {
    const pool = getPool();
    if (!pool) {
      return Array.from(getUserStore(userId).diseaseAssessments.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return await withUserTransaction(userId, async (client) => {
      const res = await client.query(
        'SELECT * FROM disease_assessments WHERE deleted_at IS NULL ORDER BY created_at DESC'
      );
      return res.rows.map((r) => ({
        id: r.id,
        ownerId: r.owner_id,
        fieldId: r.field_id,
        cropCode: r.crop_code,
        storageKey: r.storage_key,
        imageSha256: r.image_sha256,
        predictedClass: r.predicted_class,
        confidence: r.confidence ? Number(r.confidence) : null,
        status: r.status,
        abstentionReason: r.abstention_reason || null,
        classProbabilities: r.class_probabilities,
        nextSteps: r.next_steps,
        modelVersion: r.model_version,
        createdAt: r.created_at.toISOString(),
        deletedAt: r.deleted_at ? r.deleted_at.toISOString() : null,
      }));
    });
  }

  async getDiseaseAssessmentById(userId: string, assessmentId: string): Promise<DiseaseAssessmentRecord | null> {
    const pool = getPool();
    if (!pool) {
      return getUserStore(userId).diseaseAssessments.get(assessmentId) || null;
    }

    return await withUserTransaction(userId, async (client) => {
      const res = await client.query(
        'SELECT * FROM disease_assessments WHERE id = $1 AND deleted_at IS NULL',
        [assessmentId]
      );
      if (res.rows.length === 0) return null;
      const r = res.rows[0];
      return {
        id: r.id,
        ownerId: r.owner_id,
        fieldId: r.field_id,
        cropCode: r.crop_code,
        storageKey: r.storage_key,
        imageSha256: r.image_sha256,
        predictedClass: r.predicted_class,
        confidence: r.confidence ? Number(r.confidence) : null,
        status: r.status,
        abstentionReason: r.abstention_reason || null,
        classProbabilities: r.class_probabilities,
        nextSteps: r.next_steps,
        modelVersion: r.model_version,
        createdAt: r.created_at.toISOString(),
        deletedAt: r.deleted_at ? r.deleted_at.toISOString() : null,
      };
    });
  }

  async deleteDiseaseAssessment(userId: string, assessmentId: string): Promise<boolean> {
    const pool = getPool();
    if (!pool) {
      return getUserStore(userId).diseaseAssessments.delete(assessmentId);
    }

    return await withUserTransaction(userId, async (client) => {
      const res = await client.query('UPDATE disease_assessments SET deleted_at = now() WHERE id = $1', [
        assessmentId,
      ]);
      return (res.rowCount ?? 0) > 0;
    });
  }

  // ================= CROP RECOMMENDATIONS =================
  async saveRecommendation(userId: string, rec: CropRecommendationResult): Promise<CropRecommendationResult> {
    const pool = getPool();
    if (!pool) {
      getUserStore(userId).recommendations.set(rec.id, rec);
      return rec;
    }

    return await withUserTransaction(userId, async (client) => {
      const res = await client.query(
        `INSERT INTO advisory_recommendations (id, owner_id, farm_id, field_id, recommendation_type, input_snapshot, result, data_sources, engine_version)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          rec.id,
          userId,
          rec.farmId,
          rec.fieldId || null,
          'crop',
          JSON.stringify(rec.inputSnapshot),
          JSON.stringify({ rankedCrops: rec.rankedCrops, explanation: rec.explanation }),
          JSON.stringify(rec.dataSources),
          rec.engineVersion,
        ]
      );
      return rec;
    });
  }

  async getRecommendations(userId: string): Promise<CropRecommendationResult[]> {
    const pool = getPool();
    if (!pool) {
      return Array.from(getUserStore(userId).recommendations.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return await withUserTransaction(userId, async (client) => {
      const res = await client.query('SELECT * FROM advisory_recommendations ORDER BY created_at DESC');
      return res.rows.map((r) => ({
        id: r.id,
        ownerId: r.owner_id,
        farmId: r.farm_id,
        fieldId: r.field_id,
        recommendationType: r.recommendation_type,
        inputSnapshot: r.input_snapshot,
        rankedCrops: r.result.rankedCrops || [],
        explanation: r.result.explanation,
        dataSources: r.data_sources,
        engineVersion: r.engine_version,
        createdAt: r.created_at.toISOString(),
      }));
    });
  }

  // ================= CONVERSATIONS =================
  async getConversations(userId: string): Promise<Conversation[]> {
    const pool = getPool();
    if (!pool) {
      return Array.from(getUserStore(userId).conversations.values()).sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    }

    return await withUserTransaction(userId, async (client) => {
      const res = await client.query('SELECT * FROM conversations ORDER BY updated_at DESC');
      return res.rows.map((r) => ({
        id: r.id,
        ownerId: r.owner_id,
        farmId: r.farm_id,
        fieldId: r.field_id,
        language: r.language,
        title: r.title,
        createdAt: r.created_at.toISOString(),
        updatedAt: r.updated_at.toISOString(),
      }));
    });
  }

  async getConversationById(userId: string, id: string): Promise<Conversation | null> {
    const pool = getPool();
    if (!pool) {
      const store = getUserStore(userId);
      const conv = store.conversations.get(id);
      if (!conv) return null;
      const msgs = Array.from(store.messages.values())
        .filter((m) => m.conversationId === id)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      return { ...conv, messages: msgs };
    }

    return await withUserTransaction(userId, async (client) => {
      const cRes = await client.query('SELECT * FROM conversations WHERE id = $1', [id]);
      if (cRes.rows.length === 0) return null;
      const c = cRes.rows[0];

      const mRes = await client.query(
        'SELECT * FROM conversation_messages WHERE conversation_id = $1 ORDER BY created_at ASC',
        [id]
      );
      const messages: ConversationMessage[] = mRes.rows.map((m) => ({
        id: m.id,
        ownerId: m.owner_id,
        conversationId: m.conversation_id,
        role: m.role,
        content: m.content,
        structuredAdvice: m.structured_advice,
        provider: m.provider,
        model: m.model,
        createdAt: m.created_at.toISOString(),
      }));

      return {
        id: c.id,
        ownerId: c.owner_id,
        farmId: c.farm_id,
        fieldId: c.field_id,
        language: c.language,
        title: c.title,
        createdAt: c.created_at.toISOString(),
        updatedAt: c.updated_at.toISOString(),
        messages,
      };
    });
  }

  async createConversation(
    userId: string,
    data: { farmId?: string | null; fieldId?: string | null; language: 'en' | 'te'; title?: string }
  ): Promise<Conversation> {
    const pool = getPool();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    if (!pool) {
      const conv: Conversation = {
        id,
        ownerId: userId,
        farmId: data.farmId || null,
        fieldId: data.fieldId || null,
        language: data.language,
        title: data.title || (data.language === 'te' ? 'వ్యవసాయ సంభాషణ' : 'Agriculture Consultation'),
        createdAt: now,
        updatedAt: now,
        messages: [],
      };
      getUserStore(userId).conversations.set(id, conv);
      return conv;
    }

    return await withUserTransaction(userId, async (client) => {
      const res = await client.query(
        `INSERT INTO conversations (id, owner_id, farm_id, field_id, language, title)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          id,
          userId,
          data.farmId || null,
          data.fieldId || null,
          data.language,
          data.title || (data.language === 'te' ? 'వ్యవసాయ సంభాషణ' : 'Agriculture Consultation'),
        ]
      );
      const c = res.rows[0];
      return {
        id: c.id,
        ownerId: c.owner_id,
        farmId: c.farm_id,
        fieldId: c.field_id,
        language: c.language,
        title: c.title,
        createdAt: c.created_at.toISOString(),
        updatedAt: c.updated_at.toISOString(),
        messages: [],
      };
    });
  }

  async addMessage(
    userId: string,
    conversationId: string,
    message: {
      role: 'user' | 'assistant';
      content: string;
      structuredAdvice?: any;
      provider?: string;
      model?: string;
    }
  ): Promise<ConversationMessage> {
    const pool = getPool();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    if (!pool) {
      const msg: ConversationMessage = {
        id,
        ownerId: userId,
        conversationId,
        role: message.role,
        content: message.content,
        structuredAdvice: message.structuredAdvice || null,
        provider: message.provider || null,
        model: message.model || null,
        createdAt: now,
      };
      const store = getUserStore(userId);
      store.messages.set(id, msg);
      const conv = store.conversations.get(conversationId);
      if (conv) conv.updatedAt = now;
      return msg;
    }

    return await withUserTransaction(userId, async (client) => {
      const res = await client.query(
        `INSERT INTO conversation_messages (id, owner_id, conversation_id, role, content, structured_advice, provider, model)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          id,
          userId,
          conversationId,
          message.role,
          message.content,
          message.structuredAdvice ? JSON.stringify(message.structuredAdvice) : null,
          message.provider || null,
          message.model || null,
        ]
      );
      await client.query('UPDATE conversations SET updated_at = now() WHERE id = $1', [conversationId]);
      const m = res.rows[0];
      return {
        id: m.id,
        ownerId: m.owner_id,
        conversationId: m.conversation_id,
        role: m.role,
        content: m.content,
        structuredAdvice: m.structured_advice,
        provider: m.provider,
        model: m.model,
        createdAt: m.created_at.toISOString(),
      };
    });
  }

  async deleteConversation(userId: string, id: string): Promise<boolean> {
    const pool = getPool();
    if (!pool) {
      return getUserStore(userId).conversations.delete(id);
    }

    return await withUserTransaction(userId, async (client) => {
      const res = await client.query('DELETE FROM conversations WHERE id = $1', [id]);
      return (res.rowCount ?? 0) > 0;
    });
  }

  // ================= ALERT PREFERENCES =================
  async getAlertPreferences(userId: string, farmId: string): Promise<AlertPreferences> {
    const pool = getPool();
    const defaultPrefs: AlertPreferences = {
      id: crypto.randomUUID(),
      ownerId: userId,
      farmId,
      enabled: true,
      channels: { inApp: true, sms: false, email: false },
      thresholds: { heavyRainMm: 25, extremeHeatC: 38, frostC: 4, highWindKmh: 35 },
      updatedAt: new Date().toISOString(),
    };

    if (!pool) {
      const store = getUserStore(userId);
      let prefs = store.alertPreferences.get(farmId);
      if (!prefs) {
        prefs = defaultPrefs;
        store.alertPreferences.set(farmId, prefs);
      }
      return prefs;
    }

    return await withUserTransaction(userId, async (client) => {
      const res = await client.query('SELECT * FROM alert_preferences WHERE farm_id = $1', [farmId]);
      if (res.rows.length === 0) {
        // Create default
        const ins = await client.query(
          `INSERT INTO alert_preferences (owner_id, farm_id, enabled, channels, thresholds)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [
            userId,
            farmId,
            defaultPrefs.enabled,
            JSON.stringify(defaultPrefs.channels),
            JSON.stringify(defaultPrefs.thresholds),
          ]
        );
        const r = ins.rows[0];
        return {
          id: r.id,
          ownerId: r.owner_id,
          farmId: r.farm_id,
          enabled: r.enabled,
          channels: r.channels,
          thresholds: r.thresholds,
          updatedAt: r.updated_at.toISOString(),
        };
      }
      const r = res.rows[0];
      return {
        id: r.id,
        ownerId: r.owner_id,
        farmId: r.farm_id,
        enabled: r.enabled,
        channels: r.channels,
        thresholds: r.thresholds,
        updatedAt: r.updated_at.toISOString(),
      };
    });
  }

  async updateAlertPreferences(
    userId: string,
    farmId: string,
    updates: Partial<AlertPreferences>
  ): Promise<AlertPreferences> {
    const current = await this.getAlertPreferences(userId, farmId);
    const updated: AlertPreferences = {
      ...current,
      ...updates,
      channels: { ...current.channels, ...updates.channels },
      thresholds: { ...current.thresholds, ...updates.thresholds },
      updatedAt: new Date().toISOString(),
    };

    const pool = getPool();
    if (!pool) {
      getUserStore(userId).alertPreferences.set(farmId, updated);
      return updated;
    }

    return await withUserTransaction(userId, async (client) => {
      const res = await client.query(
        `INSERT INTO alert_preferences (owner_id, farm_id, enabled, channels, thresholds, updated_at)
         VALUES ($1, $2, $3, $4, $5, now())
         ON CONFLICT (owner_id, farm_id) DO UPDATE
         SET enabled = EXCLUDED.enabled,
             channels = EXCLUDED.channels,
             thresholds = EXCLUDED.thresholds,
             updated_at = now()
         RETURNING *`,
        [
          userId,
          farmId,
          updated.enabled,
          JSON.stringify(updated.channels),
          JSON.stringify(updated.thresholds),
        ]
      );
      const r = res.rows[0];
      return {
        id: r.id,
        ownerId: r.owner_id,
        farmId: r.farm_id,
        enabled: r.enabled,
        channels: r.channels,
        thresholds: r.thresholds,
        updatedAt: r.updated_at.toISOString(),
      };
    });
  }

  // ================= UNIFIED USER HISTORY =================
  async getUnifiedHistory(userId: string, filterType = 'all'): Promise<HistoryResponse> {
    const [farms, fields, readings, assessments, recs, convs] = await Promise.all([
      this.getFarms(userId),
      this.getFields(userId),
      this.getSoilReadings(userId),
      this.getDiseaseAssessments(userId),
      this.getRecommendations(userId),
      this.getConversations(userId),
    ]);

    const farmMap = new Map(farms.map((f) => [f.id, f.name]));
    const fieldMap = new Map(fields.map((f) => [f.id, { name: f.name, farmId: f.farmId }]));

    const items: HistoryItem[] = [];

    // 1. Disease Assessments
    if (filterType === 'all' || filterType === 'disease') {
      for (const a of assessments) {
        const fieldInfo = a.fieldId ? fieldMap.get(a.fieldId) : null;
        const farmName = fieldInfo ? farmMap.get(fieldInfo.farmId) : null;
        items.push({
          id: a.id,
          type: 'disease',
          title: `Crop Health Scan: ${a.predictedClass ? a.predictedClass.replace(/_/g, ' ') : a.status.toUpperCase()}`,
          summary:
            a.status === 'completed'
              ? `Confidence: ${(Number(a.confidence) * 100).toFixed(1)}%`
              : a.abstentionReason || 'Scan assessment logged',
          farmName: farmName || null,
          fieldName: fieldInfo?.name || null,
          timestamp: a.createdAt,
          details: a,
        });
      }
    }

    // 2. Soil Readings
    if (filterType === 'all' || filterType === 'soil') {
      for (const r of readings) {
        const fieldInfo = fieldMap.get(r.fieldId);
        const farmName = fieldInfo ? farmMap.get(fieldInfo.farmId) : null;
        items.push({
          id: r.id,
          type: 'soil',
          title: `Soil Observation (${r.source.toUpperCase()})`,
          summary: `Moisture: ${r.moisturePct ?? 'N/A'}% | pH: ${r.ph ?? 'N/A'} | Temp: ${r.temperatureC ?? 'N/A'}°C`,
          farmName: farmName || null,
          fieldName: fieldInfo?.name || null,
          timestamp: r.observedAt,
          details: r,
        });
      }
    }

    // 3. Crop Recommendations
    if (filterType === 'all' || filterType === 'recommendation') {
      for (const rec of recs) {
        const farmName = farmMap.get(rec.farmId);
        const fieldInfo = rec.fieldId ? fieldMap.get(rec.fieldId) : null;
        const topCrop = rec.rankedCrops[0]?.cropName.en || 'General Advice';
        items.push({
          id: rec.id,
          type: 'recommendation',
          title: `Crop Suitability Advisory: ${topCrop}`,
          summary: rec.explanation.summary || 'Suitability score calculated against field conditions.',
          farmName: farmName || null,
          fieldName: fieldInfo?.name || null,
          timestamp: rec.createdAt,
          details: rec,
        });
      }
    }

    // 4. Conversations
    if (filterType === 'all' || filterType === 'conversation') {
      for (const c of convs) {
        const farmName = c.farmId ? farmMap.get(c.farmId) : null;
        items.push({
          id: c.id,
          type: 'conversation',
          title: c.title || 'Farmer Voice/Text Chat',
          summary: `Language: ${c.language === 'te' ? 'తెలుగు' : 'English'}`,
          farmName: farmName || null,
          fieldName: null,
          timestamp: c.updatedAt,
          details: c,
        });
      }
    }

    // Sort descending by timestamp
    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      items,
      totalCount: items.length,
      page: 1,
      totalPages: 1,
    };
  }

  // ================= ACCOUNT EXPORT & DELETION =================
  async exportUserData(userId: string): Promise<AccountDataExport> {
    const [farms, fields, soilReadings, diseaseAssessments, cropRecommendations, conversations] =
      await Promise.all([
        this.getFarms(userId),
        this.getFields(userId),
        this.getSoilReadings(userId),
        this.getDiseaseAssessments(userId),
        this.getRecommendations(userId),
        this.getConversations(userId),
      ]);

    return {
      user: { id: userId },
      farms,
      fields,
      soilReadings,
      diseaseAssessments,
      cropRecommendations,
      weatherSnapshots: [],
      conversations,
      exportedAt: new Date().toISOString(),
    };
  }

  async deleteAccountAndData(userId: string): Promise<void> {
    const pool = getPool();
    if (!pool) {
      memoryStores.delete(userId);
      return;
    }

    await withUserTransaction(userId, async (client) => {
      // Cascades automatically via PostgreSQL ON DELETE CASCADE constraints
      await client.query('DELETE FROM users WHERE id = $1', [userId]);
    });
  }
}

export const dataRepository = new DataRepository();
