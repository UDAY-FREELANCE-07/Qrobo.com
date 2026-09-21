import app from './app';
import { env } from './config/env';

const startServer = async () => {
  try {
    const PORT = env.PORT || 5000;
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is running in ${env.NODE_ENV} mode on port ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
