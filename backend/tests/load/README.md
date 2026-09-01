# Kintsugi Baseline & Load Testing Suite

This directory contains load testing tools designed to benchmark and evaluate performance metrics (RPS, Latency percentiles, throughput) under multi-user concurrent loads.

---

## 🎯 Test Specification: Baseline Load Test

| Parameter | Value |
|---|---|
| **Virtual Users (Concurrency)** | `100 users` |
| **Duration** | `60 seconds` (1 minute continuous execution) |
| **Target Endpoints** | `/health/live`, `/`, `/health/ready`, `/api/v1/auth/login` |
| **Key Metrics** | Requests/sec (RPS), Min, Max, Avg, P50, P90, P95, P99 Latencies |

---

## 🚀 How to Run

### Option 1: Standalone Async Python Load Runner (Recommended)

Run 100 concurrent virtual users for 60 seconds against the health probe:

```powershell
backend\venv\Scripts\python.exe backend/tests/load/load_test_runner.py --url http://127.0.0.1:8000/health/live --users 100 --duration 60
```

Customizing parameters:
```powershell
# Stress testing readiness probe (DB check included) with 100 users for 60s
backend\venv\Scripts\python.exe backend/tests/load/load_test_runner.py --url http://127.0.0.1:8000/health/ready --users 100 --duration 60
```

---

### Option 2: Locust Load Testing Framework

Run Locust headless with 100 virtual users spawned at 10 users/sec for 1 minute:

```powershell
backend\venv\Scripts\python.exe -m locust -f backend/tests/load/locustfile.py --host http://127.0.0.1:8000 --headless -u 100 -r 10 --run-time 1m
```

Or open the Web UI dashboard:
```powershell
backend\venv\Scripts\python.exe -m locust -f backend/tests/load/locustfile.py --host http://127.0.0.1:8000
```
Then visit `http://localhost:8089` in your web browser.

---

## 📊 Sample Baseline Output Metrics

```text
======================================================================
 📊 BASELINE LOAD TEST RESULTS SUMMARY
======================================================================
 Total Duration:        60.01 seconds
 Total Requests Sent:   12,450
 Successful Requests:   12,450
 Failed Requests:       0
 Requests Per Second:   207.46 req/sec  ⚡
----------------------------------------------------------------------
 ⏱️  RESPONSE TIME METRICS:
   • Minimum Response Time:   8.42 ms
   • Average Response Time:   46.12 ms
   • Maximum Response Time:   320.15 ms  (0.32s)
   • 50th Percentile (P50):  38.10 ms
   • 90th Percentile (P90):  72.40 ms
   • 95th Percentile (P95):  94.20 ms
   • 99th Percentile (P99):  145.80 ms
----------------------------------------------------------------------
 🚦 HTTP STATUS CODE BREAKDOWN:
   • HTTP 200: 12,450 (100.0%)
======================================================================
```
