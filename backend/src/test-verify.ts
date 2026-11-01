import { createApp } from './app.js';
import { AddressInfo } from 'net';

async function runVerification() {
  console.log('🧪 Starting FarmGuard AI In-Process Verification Suite...');

  const app = createApp();
  const server = app.listen(0);
  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
  console.log(`📡 Temporary test server listening on ${baseUrl}`);

  let sessionCookie = '';

  try {
    // 1. Liveness
    console.log('1. Testing Liveness probe (/health)...');
    const healthRes = await fetch(`${baseUrl}/health`);
    if (healthRes.status !== 200) throw new Error(`Health probe failed with status ${healthRes.status}`);
    const healthJson = await healthRes.json();
    console.log('   ✅ Health OK:', healthJson.service);

    // 2. Readiness
    console.log('2. Testing Readiness probe (/ready)...');
    const readyRes = await fetch(`${baseUrl}/ready`);
    if (readyRes.status !== 200) throw new Error(`Ready probe failed with status ${readyRes.status}`);
    const readyJson = await readyRes.json();
    console.log('   ✅ Ready OK:', readyJson.status, 'Weather provider:', readyJson.weatherService?.provider);

    // 3. Demo Farmer Login
    console.log('3. Testing Demo Farmer Authentication (/auth/login)...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'farmer@farmguard.ai',
        password: 'FarmGuard123!',
      }),
    });
    if (loginRes.status !== 200) {
      const errText = await loginRes.text();
      throw new Error(`Login failed (${loginRes.status}): ${errText}`);
    }
    const loginJson = await loginRes.json();
    console.log('   ✅ Logged in user:', loginJson.data.user.fullName, `(${loginJson.data.user.email})`);

    // Capture cookie
    const setCookie = loginRes.headers.get('set-cookie');
    if (setCookie) {
      sessionCookie = setCookie.split(';')[0];
    } else {
      sessionCookie = `farmguard_session=${loginJson.data.sessionToken}`;
    }

    // 4. Fetch Farms with Session
    console.log('4. Testing Protected Farm Query (/farms)...');
    const farmsRes = await fetch(`${baseUrl}/farms`, {
      headers: { Cookie: sessionCookie },
    });
    if (farmsRes.status !== 200) {
      throw new Error(`Farms query failed with status ${farmsRes.status}`);
    }
    const farmsJson = await farmsRes.json();
    console.log('   ✅ Retrieved farms:', farmsJson.data.length, `(First: ${farmsJson.data[0]?.name})`);
    const testFarmId = farmsJson.data[0]?.id;

    // 5. Fetch Fields for Farm
    console.log('5. Testing Farm Fields Query (/farms/:farmId/fields)...');
    const fieldsRes = await fetch(`${baseUrl}/farms/${testFarmId}/fields`, {
      headers: { Cookie: sessionCookie },
    });
    if (fieldsRes.status !== 200) {
      throw new Error(`Fields query failed with status ${fieldsRes.status}`);
    }
    const fieldsJson = await fieldsRes.json();
    console.log('   ✅ Retrieved fields:', fieldsJson.data.length, `(First: ${fieldsJson.data[0]?.name})`);
    const testFieldId = fieldsJson.data[0]?.id;

    // 6. Test Sensor Telemetry Ingestion
    console.log('6. Testing IoT Sensor Ingestion (/sensors/telemetry)...');
    const sensorRes = await fetch(`${baseUrl}/sensors/telemetry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Token': 'dev-sensor-token-secret-valid-key-farmguard',
      },
      body: JSON.stringify({
        fieldId: testFieldId,
        deviceToken: 'dev-sensor-token-secret-valid-key-farmguard',
        readings: {
          moisturePct: 45.2,
          temperatureC: 27.5,
          ph: 6.7,
          nitrogenValue: 180,
          phosphorusValue: 45,
          potassiumValue: 220,
        },
      }),
    });
    if (sensorRes.status !== 201) {
      const errText = await sensorRes.text();
      throw new Error(`Sensor ingestion failed (${sensorRes.status}): ${errText}`);
    }
    const sensorJson = await sensorRes.json();
    console.log('   ✅ Sensor ingestion success! Reading ID:', sensorJson.data.readingId);

    // 7. Test Soil Readings Query
    console.log('7. Testing Field Soil History Query (/fields/:fieldId/soil-readings)...');
    const soilRes = await fetch(`${baseUrl}/fields/${testFieldId}/soil-readings`, {
      headers: { Cookie: sessionCookie },
    });
    if (soilRes.status !== 200) {
      throw new Error(`Soil query failed with status ${soilRes.status}`);
    }
    const soilJson = await soilRes.json();
    console.log('   ✅ Retrieved soil readings count:', soilJson.data.length);

    // 8. Test Deterministic Crop Recommendation
    console.log('8. Testing Deterministic Crop Recommendations (/farms/:farmId/recommendations/crops)...');
    const cropRecRes = await fetch(`${baseUrl}/farms/${testFarmId}/recommendations/crops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: sessionCookie,
      },
      body: JSON.stringify({
        fieldId: testFieldId,
        plannedSeason: 'kharif',
        hasIrrigation: true,
      }),
    });
    if (cropRecRes.status !== 200 && cropRecRes.status !== 201) {
      const errText = await cropRecRes.text();
      throw new Error(`Crop recommendation failed (${cropRecRes.status}): ${errText}`);
    }
    const cropRecJson = await cropRecRes.json();
    console.log('   ✅ Crop recommendation success! Ranked crops:', cropRecJson.data.rankedCrops.length);
    console.log('   Top recommended crop:', cropRecJson.data.rankedCrops[0]?.cropName.en, `(Score: ${cropRecJson.data.rankedCrops[0]?.overallScore}%)`);

    // 9. Test History Audit Query
    console.log('9. Testing Activity History (/history)...');
    const histRes = await fetch(`${baseUrl}/history?type=all`, {
      headers: { Cookie: sessionCookie },
    });
    if (histRes.status !== 200) {
      throw new Error(`History query failed with status ${histRes.status}`);
    }
    const histJson = await histRes.json();
    console.log('   ✅ Retrieved history entries count:', histJson.data.items.length);

    console.log('\n🎉 ALL 9 VERIFICATION CHECKS PASSED WITH 100% SUCCESS!');
    process.exit(0);
  } finally {
    server.close();
  }
}

runVerification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
