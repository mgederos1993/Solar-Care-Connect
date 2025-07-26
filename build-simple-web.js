#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Creating simple web build...');
console.log('Node version:', process.version);
console.log('Current directory:', process.cwd());

function createWebBuild() {
  console.log('Creating web build directory...');
  
  const distPath = path.join(process.cwd(), 'dist');
  
  // Ensure dist directory exists
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
  }
  
  // Create a comprehensive landing page
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1.00001,viewport-fit=cover" />
    <title>Solar Care Connect - AI Solar Appointments</title>
    <meta name="description" content="AI-powered solar appointment generation app that automatically calls potential customers and schedules qualified appointments for solar businesses." />
    <link rel="manifest" href="./manifest.json" />
    <meta name="theme-color" content="#3B82F6" />
    <link rel="icon" href="https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&q=80" />
    <style>
        * {
            box-sizing: border-box;
        }
        html, body {
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            background-color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        body {
            display: flex;
            overflow-y: auto;
            overscroll-behavior-y: none;
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            -ms-overflow-style: scrollbar;
        }
        .app-container {
            width: 100%;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            text-align: center;
        }
        .content-card {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            animation: fadeInUp 0.8s ease-out;
        }
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .logo {
            width: 100px;
            height: 100px;
            margin: 0 auto 24px;
            background: linear-gradient(135deg, #3B82F6, #1D4ED8);
            border-radius: 25px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 40px;
            font-weight: bold;
            box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
        }
        .title {
            color: #1F2937;
            margin-bottom: 16px;
            font-size: 32px;
            font-weight: 700;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .subtitle {
            color: #6B7280;
            margin-bottom: 32px;
            line-height: 1.6;
            font-size: 18px;
        }
        .cta-button {
            background: linear-gradient(135deg, #3B82F6, #1D4ED8);
            color: white;
            padding: 18px 36px;
            border: none;
            border-radius: 50px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s ease;
            box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .cta-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 30px rgba(59, 130, 246, 0.4);
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 30px;
            margin: 50px 0;
            width: 100%;
        }
        .feature {
            background: #F8FAFC;
            padding: 30px;
            border-radius: 15px;
            border: 1px solid #E2E8F0;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .feature:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        .feature-icon {
            font-size: 32px;
            margin-bottom: 16px;
        }
        .feature-title {
            font-size: 20px;
            font-weight: 600;
            color: #1F2937;
            margin-bottom: 12px;
        }
        .feature-desc {
            font-size: 16px;
            color: #6B7280;
            line-height: 1.6;
        }
        .stats {
            display: flex;
            justify-content: space-around;
            margin: 40px 0;
            padding: 30px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 15px;
            color: white;
        }
        .stat {
            text-align: center;
        }
        .stat-number {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .stat-label {
            font-size: 14px;
            opacity: 0.9;
        }
        .contact {
            margin-top: 40px;
            padding-top: 30px;
            border-top: 2px solid #E5E7EB;
            color: #6B7280;
            font-size: 16px;
        }
        .contact a {
            color: #3B82F6;
            text-decoration: none;
            font-weight: 600;
            transition: color 0.3s ease;
        }
        .contact a:hover {
            color: #1D4ED8;
        }
        @media (max-width: 768px) {
            .content-card {
                padding: 30px 20px;
                margin: 10px;
            }
            .title {
                font-size: 28px;
            }
            .subtitle {
                font-size: 16px;
            }
            .features {
                grid-template-columns: 1fr;
                margin: 30px 0;
            }
            .stats {
                flex-direction: column;
                gap: 20px;
            }
        }
    </style>
</head>
<body>
    <noscript>
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 20px;">
            <div>
                <h2>JavaScript Required</h2>
                <p>Solar Care Connect requires JavaScript to run. Please enable JavaScript in your browser and refresh the page.</p>
            </div>
        </div>
    </noscript>
    
    <div class="app-container">
        <div class="content-card">
            <div class="logo">☀️</div>
            <h1 class="title">Solar Care Connect</h1>
            <p class="subtitle">
                AI-Powered Solar Appointments - Get qualified solar leads and appointments automatically generated by our advanced AI system.
            </p>
            
            <div class="stats">
                <div class="stat">
                    <div class="stat-number">500+</div>
                    <div class="stat-label">Appointments Generated</div>
                </div>
                <div class="stat">
                    <div class="stat-number">95%</div>
                    <div class="stat-label">Qualification Rate</div>
                </div>
                <div class="stat">
                    <div class="stat-number">24/7</div>
                    <div class="stat-label">AI Operation</div>
                </div>
            </div>
            
            <a href="https://form.jotform.com/251608739182059" class="cta-button" target="_blank">
                Get Started Today
            </a>
            
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">🤖</div>
                    <div class="feature-title">AI-Powered Calls</div>
                    <div class="feature-desc">Our advanced AI system automatically calls potential solar customers in your target area with natural conversation flow</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">📅</div>
                    <div class="feature-title">Qualified Appointments</div>
                    <div class="feature-desc">Only pre-qualified, interested prospects are scheduled directly to your calendar - no time wasters</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">🔄</div>
                    <div class="feature-title">No-Show Replacements</div>
                    <div class="feature-desc">All no-show appointments are automatically replaced at no extra cost - guaranteed results</div>
                </div>
            </div>
            
            <div class="contact">
                Need help or have questions? Contact our support team at 
                <a href="mailto:solarcareconnect@gmail.com">solarcareconnect@gmail.com</a>
            </div>
        </div>
    </div>
</body>
</html>`;

  // Create manifest.json
  const manifest = {
    "short_name": "Solar Care Connect",
    "name": "Solar Care Connect - AI Solar Appointments",
    "icons": [
      {
        "src": "https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=192&q=80",
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": "https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=512&q=80",
        "sizes": "512x512",
        "type": "image/png"
      }
    ],
    "start_url": "/",
    "display": "standalone",
    "theme_color": "#3B82F6",
    "background_color": "#ffffff"
  };

  try {
    fs.writeFileSync(path.join(distPath, 'index.html'), indexHtml);
    fs.writeFileSync(path.join(distPath, 'manifest.json'), JSON.stringify(manifest, null, 2));
    
    console.log('✅ Web build created successfully!');
    console.log('📁 Output directory:', distPath);
    console.log('📄 Files created:');
    console.log('   - index.html');
    console.log('   - manifest.json');
    
    return true;
  } catch (error) {
    console.error('❌ Error creating web build:', error);
    return false;
  }
}

function main() {
  try {
    const success = createWebBuild();
    
    if (success) {
      console.log('🎉 Build process completed successfully!');
      process.exit(0);
    } else {
      console.error('💥 Build process failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Build process failed:', error);
    process.exit(1);
  }
}

main();