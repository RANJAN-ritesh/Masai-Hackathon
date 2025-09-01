import Hackathon from '../model/hackathon';

class ProblemSelectionService {
  private pollExpirationInterval: NodeJS.Timeout | null = null;

  public startServices() {
    console.log('🔄 Starting Problem Selection Services...');

    // Basic service for now - can be enhanced later
    this.pollExpirationInterval = setInterval(() => {
      console.log('🔍 Problem Selection Service running...');
    }, 60 * 60 * 1000); // 1 hour

    console.log('✅ Problem Selection Services started successfully');
  }

  public stopServices() {
    if (this.pollExpirationInterval) {
      clearInterval(this.pollExpirationInterval);
      this.pollExpirationInterval = null;
    }
    console.log('🛑 Problem Selection Services stopped');
  }
}

export const problemSelectionService = new ProblemSelectionService();
