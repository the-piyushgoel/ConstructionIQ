# Construction IQ Intelligence API Documentation

## Base URL
`/api/v1/intelligence`

## Authentication
All endpoints require a Bearer token in the Authorization header.
```http
Authorization: Bearer <token>
```

---

## 1. Run Full Intelligence Pipeline
**Endpoint:** `POST /full`

**Purpose:** Executes the complete end-to-end intelligence and simulation workflow. This includes risk prediction, agent-based recommendations, decision orchestration, and simulation-backed recovery planning.

### Request Schema
```json
{
  "projectId": "string (UUID)",
  "riskEventId": "string (UUID)"
}
```

### Example Request
```bash
curl -X POST http://localhost:4000/api/v1/intelligence/full \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "123e4567-e89b-12d3-a456-426614174000",
    "riskEventId": "123e4567-e89b-12d3-a456-426614174001"
  }'
```

### Example Response (200 OK)
```json
{
  "success": true,
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "decisionPackage": {
      "metadata": {
        "generatedAt": "2026-07-21T10:00:00Z",
        "agentCount": 3,
        "successfulAgents": 3,
        "failedAgents": 0
      }
    },
    "simulationResults": [
      {
        "id": "sim-1",
        "confidenceScore": 92
      }
    ],
    "recoveryPlans": [
      {
        "id": "plan-1",
        "status": "generated"
      }
    ],
    "recommendedRecoveryPlan": {
      "id": "plan-1",
      "recommendationConfidence": 92
    },
    "humanApprovalRequired": true,
    "metadata": {
      "processingTimeMs": 2540
    }
  },
  "metadata": {
    "timestamp": "2026-07-21T10:00:02Z"
  }
}
```

---

## 2. Run Prediction Only
**Endpoint:** `POST /prediction`

**Purpose:** Calculates prediction values and attributions based on configured AI models without running agent delegation or simulations.

### Request Schema
```json
{
  "projectId": "string (UUID)",
  "riskEventId": "string (UUID)"
}
```

### Example Request
```bash
curl -X POST http://localhost:4000/api/v1/intelligence/prediction \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "123e4567-e89b-12d3-a456-426614174000",
    "riskEventId": "123e4567-e89b-12d3-a456-426614174001"
  }'
```

### Example Response (200 OK)
```json
{
  "success": true,
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "prediction": {
      "id": "pred-1",
      "score": 85,
      "horizonDays": 14
    },
    "attribution": {
      "rootCauses": ["Weather Delay", "Material Shortage"],
      "evidence": ["Supplier email", "Weather forecast"],
      "confidence": 88
    },
    "context": {
      "projectDetails": {},
      "identifiedRisks": [],
      "historicalPredictions": [],
      "publicSignals": []
    }
  },
  "metadata": {
    "timestamp": "2026-07-21T10:00:02Z"
  }
}
```

---

## 3. Run Decision Orchestrator Only
**Endpoint:** `POST /decision`

**Purpose:** Submits manually provided predictions and attributions directly to the Multi-Agent layer to achieve a decision consensus, stopping before simulation.

### Request Schema
```json
{
  "projectId": "string (UUID)",
  "prediction": {
    "id": "string (UUID)",
    "predictedScore": "number",
    "horizonDays": "number (optional)"
  },
  "attribution": {
    "rootCauses": ["string"],
    "evidence": ["string"],
    "confidence": "number"
  },
  "intelligenceContext": {
    "projectDetails": "object",
    "identifiedRisks": ["object"],
    "historicalPredictions": ["object"],
    "publicSignals": [
      {
        "source": "string",
        "type": "string",
        "value": "any",
        "confidence": "number",
        "timestamp": "string"
      }
    ]
  }
}
```

### Example Request
```bash
curl -X POST http://localhost:4000/api/v1/intelligence/decision \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "123e4567-e89b-12d3-a456-426614174000",
    "prediction": {
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "predictedScore": 85,
      "horizonDays": 14
    },
    "attribution": {
      "rootCauses": ["delay"],
      "evidence": ["schedule slip"],
      "confidence": 90
    },
    "intelligenceContext": {
      "projectDetails": {},
      "identifiedRisks": [],
      "historicalPredictions": [],
      "publicSignals": []
    }
  }'
```

### Example Response (200 OK)
```json
{
  "success": true,
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "agentResponses": [],
    "consensus": {
      "score": 85,
      "agreementRatio": 0.9,
      "recommendations": []
    }
  },
  "metadata": {
    "timestamp": "2026-07-21T10:00:02Z"
  }
}
```

---

## Error Responses

**400 Bad Request (Validation Error)**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "issues": [
      {
        "path": ["body", "projectId"],
        "message": "Invalid projectId"
      }
    ]
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid authorization header"
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**404 Not Found**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```
