"""
Baseline/Load Testing Engine for Kintsugi FastAPI Application.

Executes concurrent virtual user stress tests according to specified parameters:
- Virtual Users: 100
- Test Duration: 60 seconds (1 minute)
- Metrics: RPS (Requests per second), Min, Max, Avg, P50, P90, P95, P99 Response Times.
"""

import os
import sys
import time
import argparse
import asyncio
import statistics
from typing import List, Dict
import httpx

class BaselineLoadTester:
    def __init__(self, target_url: str, concurrent_users: int, duration_seconds: int):
        self.target_url = target_url
        self.concurrent_users = concurrent_users
        self.duration_seconds = duration_seconds
        self.latencies_ms: List[float] = []
        self.status_codes: Dict[int, int] = {}
        self.total_errors = 0
        self.start_time = 0.0
        self.end_time = 0.0

    async def _worker(self, user_id: int, stop_time: float, client: httpx.AsyncClient):
        """Simulates 1 Virtual User sending continuous requests until stop_time."""
        while time.time() < stop_time:
            req_start = time.perf_counter()
            try:
                response = await client.get(self.target_url, timeout=10.0)
                req_end = time.perf_counter()
                latency_ms = (req_end - req_start) * 1000.0

                self.latencies_ms.append(latency_ms)
                code = response.status_code
                self.status_codes[code] = self.status_codes.get(code, 0) + 1
            except Exception as e:
                req_end = time.perf_counter()
                self.total_errors += 1
                code_key = -1
                self.status_codes[code_key] = self.status_codes.get(code_key, 0) + 1

    async def run(self):
        print("=" * 70)
        print(" [LOAD TEST] KINTSUGI BASELINE LOAD TEST RUNNER")
        print("=" * 70)
        print(f" Target URL:        {self.target_url}")
        print(f" Virtual Users:     {self.concurrent_users}")
        print(f" Test Duration:     {self.duration_seconds} seconds")
        print(" Starting load generation... Please wait.")
        print("-" * 70)

        limits = httpx.Limits(max_keepalive_connections=self.concurrent_users, max_connections=self.concurrent_users * 2)
        async with httpx.AsyncClient(limits=limits, verify=False) as client:
            self.start_time = time.time()
            stop_time = self.start_time + self.duration_seconds

            # Create coroutines for concurrent virtual users
            tasks = [
                asyncio.create_task(self._worker(user_id=i, stop_time=stop_time, client=client))
                for i in range(self.concurrent_users)
            ]

            # Periodic progress tracker
            while time.time() < stop_time:
                elapsed = round(time.time() - self.start_time, 1)
                req_count = len(self.latencies_ms) + self.total_errors
                current_rps = req_count / elapsed if elapsed > 0 else 0
                print(f" Progress: [{elapsed:4.1f}s / {self.duration_seconds}s] | Sent: {req_count} reqs | Current RPS: {current_rps:6.1f} req/sec", end="\r")
                await asyncio.sleep(1.0)

            await asyncio.gather(*tasks)
            self.end_time = time.time()

        print("\n" + "-" * 70)
        self.print_report()

    def print_report(self):
        total_requests = len(self.latencies_ms) + self.total_errors
        actual_duration = max(self.end_time - self.start_time, 0.001)
        rps = total_requests / actual_duration

        if self.latencies_ms:
            sorted_lat = sorted(self.latencies_ms)
            min_ms = sorted_lat[0]
            max_ms = sorted_lat[-1]
            avg_ms = statistics.mean(sorted_lat)
            p50_ms = sorted_lat[int(len(sorted_lat) * 0.50)]
            p90_ms = sorted_lat[int(len(sorted_lat) * 0.90)]
            p95_ms = sorted_lat[int(len(sorted_lat) * 0.95)]
            p99_ms = sorted_lat[int(len(sorted_lat) * 0.99)]
        else:
            min_ms = max_ms = avg_ms = p50_ms = p90_ms = p95_ms = p99_ms = 0.0

        print("\n" + "=" * 70)
        print(" [RESULTS] BASELINE LOAD TEST RESULTS SUMMARY")
        print("=" * 70)
        print(f" Total Duration:        {actual_duration:.2f} seconds")
        print(f" Total Requests Sent:   {total_requests:,}")
        print(f" Successful Requests:   {len(self.latencies_ms):,}")
        print(f" Failed Requests:       {self.total_errors:,}")
        print(f" Requests Per Second:   {rps:.2f} req/sec")
        print("-" * 70)
        print(" RESPONSE TIME METRICS:")
        print(f"   * Minimum Response Time:   {min_ms:.2f} ms")
        print(f"   * Average Response Time:   {avg_ms:.2f} ms")
        print(f"   * Maximum Response Time:   {max_ms:.2f} ms  ({max_ms/1000.0:.2f}s)")
        print(f"   * 50th Percentile (P50):  {p50_ms:.2f} ms")
        print(f"   * 90th Percentile (P90):  {p90_ms:.2f} ms")
        print(f"   * 95th Percentile (P95):  {p95_ms:.2f} ms")
        print(f"   * 99th Percentile (P99):  {p99_ms:.2f} ms")
        print("-" * 70)
        print(" HTTP STATUS CODE BREAKDOWN:")
        for code, count in sorted(self.status_codes.items()):
            label = "NETWORK ERROR / TIMEOUT" if code == -1 else f"HTTP {code}"
            pct = (count / total_requests) * 100.0 if total_requests > 0 else 0
            print(f"   * {label}: {count:,} ({pct:.1f}%)")
        print("=" * 70)

        # Write Markdown Step Summary if running inside GitHub Actions
        github_summary_file = os.getenv("GITHUB_STEP_SUMMARY")
        if github_summary_file:
            try:
                with open(github_summary_file, "a", encoding="utf-8") as f:
                    f.write("## ⚡ Kintsugi Baseline Load Test Results\n\n")
                    f.write(f"- **Target URL**: `{self.target_url}`\n")
                    f.write(f"- **Virtual Concurrent Users**: `{self.concurrent_users} users`\n")
                    f.write(f"- **Duration**: `{actual_duration:.2f}s`\n")
                    f.write(f"- **Total Requests Sent**: `{total_requests:,}`\n")
                    f.write(f"- **Requests Per Second (RPS)**: **`{rps:.2f} req/sec`** ⚡\n\n")
                    f.write("### ⏱️ Response Time Breakdown\n\n")
                    f.write("| Metric | Value (ms) | Description |\n")
                    f.write("|---|---|---|\n")
                    f.write(f"| **Minimum Response Time** | `{min_ms:.2f} ms` | Fastest response |\n")
                    f.write(f"| **Average Response Time** | `{avg_ms:.2f} ms` | Mean response time |\n")
                    f.write(f"| **50th Percentile (P50)** | `{p50_ms:.2f} ms` | Median response time |\n")
                    f.write(f"| **90th Percentile (P90)** | `{p90_ms:.2f} ms` | 90% of requests faster than |\n")
                    f.write(f"| **95th Percentile (P95)** | `{p95_ms:.2f} ms` | 95% of requests faster than |\n")
                    f.write(f"| **99th Percentile (P99)** | `{p99_ms:.2f} ms` | 99% of requests faster than |\n")
                    f.write(f"| **Maximum Response Time** | `{max_ms:.2f} ms` | Slowest response |\n\n")
            except Exception as err:
                print(f"Warning: Failed to write GitHub step summary: {err}")

def main():
    parser = argparse.ArgumentParser(description="Kintsugi Baseline Load Test Runner")
    parser.add_argument("--url", type=str, default="http://127.0.0.1:8000/health/live", help="Target URL endpoint")
    parser.add_argument("--users", type=int, default=100, help="Number of virtual users (default: 100)")
    parser.add_argument("--duration", type=int, default=60, help="Test duration in seconds (default: 60)")
    args = parser.parse_args()

    tester = BaselineLoadTester(
        target_url=args.url,
        concurrent_users=args.users,
        duration_seconds=args.duration
    )
    asyncio.run(tester.run())

if __name__ == "__main__":
    main()
