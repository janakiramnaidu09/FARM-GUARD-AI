import { DiseaseAssessmentResponse, DiseaseAssessmentResponseSchema } from '@farmguard/shared';
import { config } from '../../config/env.js';

export class DiseaseClient {
  async predictDisease(
    imageBuffer: Buffer,
    filename: string,
    cropHint?: string
  ): Promise<DiseaseAssessmentResponse> {
    const url = new URL('/predict', config.ML_SERVICE_URL);
    if (cropHint) {
      url.searchParams.set('crop', cropHint);
    }

    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const crlf = '\r\n';

    // Construct multipart/form-data body
    const header =
      `--${boundary}${crlf}` +
      `Content-Disposition: form-data; name="file"; filename="${filename}"${crlf}` +
      `Content-Type: image/jpeg${crlf}${crlf}`;
    const footer = `${crlf}--${boundary}--${crlf}`;

    const body = Buffer.concat([
      Buffer.from(header, 'utf-8'),
      imageBuffer,
      Buffer.from(footer, 'utf-8'),
    ]);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          Authorization: `Bearer ${config.ML_SERVICE_TOKEN}`,
        },
        body,
        signal: controller.signal,
      });

      if (!response.ok) {
        let errJson: any = null;
        try {
          errJson = await response.json();
        } catch {}

        if (response.status === 503) {
          // Model unconfigured
          return {
            status: 'failed',
            predictedClass: null,
            predictedClassDisplayName: null,
            confidence: null,
            classProbabilities: [],
            modelVersion: null,
            abstentionReason:
              errJson?.detail?.message ||
              'Disease inference service is running, but trained model weights have not been configured. Run python scripts/train.py and set MODEL_PATH.',
            nextSteps: [
              {
                action: 'Configure Model Weights',
                descriptionEn:
                  'Follow services/disease-inference/README.md to train or place model weights at MODEL_PATH.',
                descriptionTe: 'మోడల్ బరువులు మరియు శిక్షణ పూర్తి చేయడానికి డాక్యుమెంటేషన్ చూడండి.',
                category: 'expert_consultation',
              },
            ],
            uncertaintyWarning:
              'Inference model is currently offline or awaiting deployment weights. No automated prediction was generated.',
          };
        }

        if (response.status === 422) {
          // Corrupted or invalid image dimensions
          return {
            status: 'unsupported',
            predictedClass: null,
            predictedClassDisplayName: null,
            confidence: null,
            classProbabilities: [],
            modelVersion: null,
            abstentionReason:
              errJson?.detail?.message ||
              'Uploaded image is corrupted or does not meet minimum quality/dimension requirements (min 100x100px).',
            nextSteps: [
              {
                action: 'Retake Photo',
                descriptionEn: 'Capture a clear, well-lit, close-up photo of the affected leaf.',
                descriptionTe: 'స్పష్టమైన వెలుతురులో ఆకును దగ్గరగా ఫోటో తీయండి.',
                category: 'retake_photo',
              },
            ],
            uncertaintyWarning: 'Assessment aborted due to unacceptable image quality or format.',
          };
        }

        throw new Error(`Inference service returned HTTP ${response.status}: ${JSON.stringify(errJson)}`);
      }

      const data = await response.json();
      return DiseaseAssessmentResponseSchema.parse(data);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return {
          status: 'failed',
          predictedClass: null,
          predictedClassDisplayName: null,
          confidence: null,
          classProbabilities: [],
          modelVersion: null,
          abstentionReason: 'Inference service request timed out after 15 seconds.',
          nextSteps: [],
          uncertaintyWarning: 'Diagnostic aborted due to network timeout.',
        };
      }

      console.warn('[DiseaseClient] Connection to inference microservice failed:', error.message);
      return {
        status: 'failed',
        predictedClass: null,
        predictedClassDisplayName: null,
        confidence: null,
        classProbabilities: [],
        modelVersion: null,
        abstentionReason:
          'The internal Python disease inference service (FastAPI at ' +
          config.ML_SERVICE_URL +
          ') is unreachable. Ensure the service is started with "uvicorn app.main:app --port 8001".',
        nextSteps: [
          {
            action: 'Start Inference Microservice',
            descriptionEn:
              'Refer to services/disease-inference/README.md to launch the OpenCV/TensorFlow service.',
            descriptionTe: 'పైథాన్ ఇన్‌ఫరెన్స్ సర్వీస్‌ను ప్రారంభించండి.',
            category: 'expert_consultation',
          },
        ],
        uncertaintyWarning:
          'Service unavailable. Automated disease classification cannot run until the internal service is active.',
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const diseaseClient = new DiseaseClient();

