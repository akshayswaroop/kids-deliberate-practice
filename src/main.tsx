
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './infrastructure/store';

async function bootstrap() {
  const shouldInstallTestBridge = import.meta.env.MODE === 'test' || import.meta.env.MODE === 'development';
  if (shouldInstallTestBridge) {
    const { installTestBridge } = await import('./app/testBridge');
    installTestBridge();
  }

  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Root container not found');
  }

  createRoot(container).render(
    <StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </StrictMode>
  );
}

void bootstrap();
