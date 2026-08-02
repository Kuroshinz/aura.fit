import { ApiResponse, createSuccessResponse, createErrorResponse } from '@/lib/api/response';

export type JobStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface BackgroundJob {
  id: string;
  type: 'export' | 'import' | 'ai_scan' | 'cache_clear';
  status: JobStatus;
  progress: number;
  result?: string;
  error?: string;
  created_at: string;
}

export class JobQueueService {
  private jobs: Map<string, BackgroundJob> = new Map();

  async enqueueJob(type: BackgroundJob['type'], payload?: any): Promise<ApiResponse<string>> {
    try {
      const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const job: BackgroundJob = {
        id: jobId,
        type,
        status: 'queued',
        progress: 0,
        created_at: new Date().toISOString()
      };
      
      // In a real application, this would insert into a Postgres `jobs` table
      // and trigger a serverless function, trigger, or Python worker to process it.
      // We simulate local state for the UI skeleton.
      this.jobs.set(jobId, job);
      
      // Simulate background processing
      this.processJobAsync(jobId, payload);
      
      return createSuccessResponse(jobId, 'Job successfully queued.');
    } catch (error: any) {
      return createErrorResponse('JOB_QUEUE_ERROR', error.message || 'Failed to queue job.');
    }
  }

  async getJobStatus(jobId: string): Promise<ApiResponse<BackgroundJob>> {
    const job = this.jobs.get(jobId);
    if (!job) {
      return createErrorResponse('JOB_NOT_FOUND', `Job ${jobId} not found.`);
    }
    return createSuccessResponse(job);
  }

  private async processJobAsync(jobId: string, payload?: any) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.status = 'running';
    job.progress = 10;
    
    // Simulate long running task
    for (let i = 20; i <= 100; i += 20) {
      await new Promise(res => setTimeout(res, 1000));
      job.progress = i;
    }
    
    job.status = 'completed';
    job.result = 'Task finished successfully.';
  }
}

export const jobQueueService = new JobQueueService();
