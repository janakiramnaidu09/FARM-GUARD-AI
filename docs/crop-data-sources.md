# FarmGuard AI — Crop Data Sources & Agronomic Methodology

FarmGuard AI calculates crop suitability deterministically based on published agricultural science and agronomy packages of practices from recognized Indian agricultural universities and research councils.

---

## 1. Authoritative Institutional Sources

All thresholds, soil pH ranges, nutrient demands, and seasonal windows embedded in the `crop_catalog` table are attributable to the following publications:

1. **ICAR (Indian Council of Agricultural Research)**
   - *Handbook of Agriculture: Facts and Figures for Farmers, Students and All Interested on Farming* (7th Edition, ICAR, New Delhi).
   - ICAR - Central Institute for Cotton Research (CICR), Nagpur.
   - ICAR - Indian Institute of Pulses Research (IIPR), Kanpur.
   - ICAR - Directorate of Groundnut Research (DGR), Junagadh.
   - ICAR - Indian Institute of Horticultural Research (IIHR), Bengaluru.

2. **PJTSAU (Professor Jayashankar Telangana State Agricultural University)**
   - *Vyavasaya Panchangam (Package of Practices for Field and Horticultural Crops)*, Directorate of Extension, Hyderabad.
   - High-Density Planting Systems (HDPS) and Integrated Pest Management in Cotton and Rice.

3. **ANGRAU (Acharya N.G. Ranga Agricultural University)**
   - *Crop Production Guide and Soil Fertility Status of Andhra Pradesh*, Regional Agricultural Research Station (RARS), Lam, Guntur.

4. **TNAU Agritech Portal**
   - Tamil Nadu Agricultural University Agronomy Guidelines and Nutrient Management.

5. **FAO (Food and Agriculture Organization of the United Nations)**
   - *Crop Water Information (AQUACROP)* and FAO EcoCrop Database.

---

## 2. Crop Agronomic Profiles & Thresholds

### 1. Rice (Paddy / వరి - *Oryza sativa*)
- **Optimal pH**: 6.0 – 7.0 (Tolerable: 5.0 – 8.0)
- **Soil Type**: Clay loam, silty clay, alluvial, heavy black soil
- **Seasons**: Kharif (Sarva), Rabi (Dalwa)
- **Optimal Temperature**: 24°C – 32°C (Min: 20°C, Max: 38°C)
- **Water & Drainage**: Submerged conditions (2–5 cm depth) or Alternate Wetting & Drying (AWD); clayey subsoil reduces percolation losses.
- **Nutrient Profile**: High Nitrogen, Medium Phosphorus, Medium Potassium.
- **Attribution**: ICAR Handbook of Agriculture (2020); PJTSAU Vyavasaya Panchangam (2023).

### 2. Cotton (పత్తి - *Gossypium hirsutum*)
- **Optimal pH**: 6.5 – 7.8 (Tolerable: 6.0 – 8.5)
- **Soil Type**: Deep black cotton soil (Vertisols), fertile red loam
- **Seasons**: Kharif
- **Optimal Temperature**: 25°C – 35°C (Min: 18°C, Max: 40°C)
- **Water & Drainage**: Deep taproot requires excellent drainage; highly vulnerable to waterlogging.
- **Nutrient Profile**: High Nitrogen, Medium Phosphorus, High Potassium.
- **Attribution**: CICR Nagpur Cotton Guide (2022); PJTSAU Commercial Cotton Advisory (2023).

### 3. Maize (Corn / మొక్కజొన్న - *Zea mays*)
- **Optimal pH**: 6.0 – 7.5 (Tolerable: 5.5 – 8.0)
- **Soil Type**: Well-drained sandy loam, loam, alluvial
- **Seasons**: Kharif, Rabi, Zaid (Summer)
- **Optimal Temperature**: 21°C – 30°C (Min: 15°C, Max: 38°C)
- **Water & Drainage**: Sensitive to water stagnation; critical irrigation at tasseling and grain-filling.
- **Nutrient Profile**: High Nitrogen, Medium Phosphorus, Medium Potassium.
- **Attribution**: ICAR Indian Institute of Maize Research (IIMR, 2021).

### 4. Groundnut (Peanut / వేరుశనగ - *Arachis hypogaea*)
- **Optimal pH**: 6.0 – 7.0 (Tolerable: 5.5 – 7.5)
- **Soil Type**: Light sandy loam, red sandy soil (Chalka)
- **Seasons**: Kharif, Rabi
- **Optimal Temperature**: 24°C – 30°C (Min: 20°C, Max: 35°C)
- **Water & Drainage**: Loose friable topsoil essential for peg penetration and pod expansion.
- **Nutrient Profile**: Low Nitrogen (rhizobial fixation), Medium Phosphorus, Medium Potassium, Gypsum (Calcium/Sulphur).
- **Attribution**: ICAR - Directorate of Groundnut Research, Junagadh (2022).

### 5. Red Gram (Pigeonpea / కంది - *Cajanus cajan*)
- **Optimal pH**: 6.5 – 7.5 (Tolerable: 6.0 – 8.0)
- **Soil Type**: Deep well-drained loam, medium black soil
- **Seasons**: Kharif
- **Optimal Temperature**: 25°C – 32°C (Min: 18°C, Max: 38°C)
- **Water & Drainage**: Deep root system affords drought tolerance; poor drainage induces Fusarium wilt.
- **Nutrient Profile**: Low Nitrogen, High Phosphorus, Low Potassium.
- **Attribution**: ICAR - Indian Institute of Pulses Research (IIPR, 2022).

### 6. Bengal Gram (Chickpea / శనగ - *Cicer arietinum*)
- **Optimal pH**: 6.5 – 7.8 (Tolerable: 6.0 – 8.5)
- **Soil Type**: Medium to heavy black soil (Vertisols), alluvial loam
- **Seasons**: Rabi
- **Optimal Temperature**: 18°C – 25°C (Min: 10°C, Max: 30°C)
- **Water & Drainage**: Residual moisture crop; light sprinkler irrigation preferred.
- **Nutrient Profile**: Low Nitrogen, High Phosphorus, Medium Potassium.
- **Attribution**: ICAR - Indian Institute of Pulses Research (2023).

### 7. Tomato (టొమాటో - *Solanum lycopersicum*)
- **Optimal pH**: 6.2 – 7.0 (Tolerable: 6.0 – 7.5)
- **Soil Type**: Rich organic sandy loam, well-drained red loam
- **Seasons**: Kharif, Rabi, Zaid
- **Optimal Temperature**: 20°C – 28°C (Min: 15°C, Max: 35°C)
- **Water & Drainage**: Drip fertigation optimal; standing moisture leads to collar rot.
- **Nutrient Profile**: Medium Nitrogen, High Phosphorus, High Potassium.
- **Attribution**: ICAR - Indian Institute of Horticultural Research (IIHR, 2021).

### 8. Chilli (మిరప - *Capsicum annuum*)
- **Optimal pH**: 6.5 – 7.2 (Tolerable: 6.0 – 7.5)
- **Soil Type**: Black loam, well-drained red clay loam, deltaic alluvium
- **Seasons**: Kharif, Rabi
- **Optimal Temperature**: 20°C – 30°C (Min: 15°C, Max: 38°C)
- **Water & Drainage**: Rapid drainage required; flower drop occurs under water stress.
- **Nutrient Profile**: High Nitrogen, Medium Phosphorus, High Potassium.
- **Attribution**: ANGRAU Chilli Production Manual (2023).

---

## 3. Deterministic Scoring Algorithm

The crop suitability engine evaluates candidate crops against field parameters using a deterministic weighted formula:

$$\text{Overall Score} = \text{round}(0.25 \times S_{\text{pH}} + 0.25 \times S_{\text{Season}} + 0.20 \times S_{\text{Moisture}} + 0.15 \times S_{\text{Temp}} + 0.15 \times S_{\text{NPK}})$$

### Suitability Classification
- $\ge 80\%$: **Highly Suitable** (అత్యంత అనుకూలం)
- $65\% - 79\%$: **Moderately Suitable** (మధ్యస్థ అనుకూలం)
- $45\% - 64\%$: **Marginally Suitable** (స్వల్ప అనుకూలం)
- $< 45\%$: **Not Recommended** (సిఫార్సు చేయబడదు)

