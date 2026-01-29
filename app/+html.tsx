import { ScrollViewStyleReset } from "expo-router/html";

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        {/* --- CONFIGURAÇÃO PWA --- */}
        {/* Esta linha faz o navegador localizar o manifesto gerado pelo Expo */}
        <link rel="manifest" href="/manifest.json" />

        {/* Ícones para diferentes dispositivos */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Tela de inicialização para iOS */}
        <link
          rel="apple-touch-startup-image"
          href="/web-app-manifest-512x512.png"
        />

        {/* Cor da barra de status no celular */}
        <meta name="theme-color" content="#2E7D32" />

        {/* Configurações específicas para iOS (Safari) */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="CEASA Pesquisa" />
        {/* ------------------------ */}

        <ScrollViewStyleReset />

        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
      </head>
      <body>
        {children}
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
            if ('serviceWorker' in navigator) {
               window.addEventListener('load', () => {
               navigator.serviceWorker.register('/sw.js');
              });
            }`,
          }}
        />
      </body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #fff;
}
`;
