import { NextResponse } from 'next/server';
import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';

// Collect default metrics
collectDefaultMetrics({ register });

// Custom metrics for AMHSJ
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register]
});

const activeUsers = new Gauge({
  name: 'active_users_total',
  help: 'Number of currently active users',
  registers: [register]
});

const articlesTotal = new Gauge({
  name: 'articles_total',
  help: 'Total number of articles in the system',
  labelNames: ['status'],
  registers: [register]
});

const reviewsTotal = new Gauge({
  name: 'reviews_total',
  help: 'Total number of reviews in the system',
  labelNames: ['status'],
  registers: [register]
});

const submissionsToday = new Gauge({
  name: 'submissions_today',
  help: 'Number of article submissions today',
  registers: [register]
});

const databaseConnections = new Gauge({
  name: 'database_connections_active',
  help: 'Number of active database connections',
  registers: [register]
});

const redisConnections = new Gauge({
  name: 'redis_connections_active',
  help: 'Number of active Redis connections',
  registers: [register]
});

export async function GET() {
  try {
    // Update custom metrics with current values
    // You would typically fetch these from your database
    
    // Example: Update articles count (replace with actual database queries)
    // const db = await getDatabase();
    // const articleCounts = await db.select().from(articles).groupBy(articles.status);
    // articleCounts.forEach(count => {
    //   articlesTotal.set({ status: count.status }, count.count);
    // });

    // For now, setting example values
    articlesTotal.set({ status: 'published' }, 150);
    articlesTotal.set({ status: 'under_review' }, 45);
    articlesTotal.set({ status: 'draft' }, 23);
    
    reviewsTotal.set({ status: 'pending' }, 67);
    reviewsTotal.set({ status: 'completed' }, 203);
    
    submissionsToday.set(8);
    activeUsers.set(12);
    databaseConnections.set(5);
    redisConnections.set(3);

    const metrics = await register.metrics();
    
    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': register.contentType,
      },
    });
  } catch (error) {
    console.error('Error generating metrics:', error);
    return NextResponse.json(
      { error: 'Failed to generate metrics' },
      { status: 500 }
    );
  }
}

// Export metrics for use in other parts of the application
export {
  httpRequestsTotal,
  httpRequestDuration,
  activeUsers,
  articlesTotal,
  reviewsTotal,
  submissionsToday,
  databaseConnections,
  redisConnections
};
