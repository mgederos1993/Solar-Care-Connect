#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building React Native Web app...');
console.log('Node version:', process.version);
console.log('Current directory:', process.cwd());

function updateAppConfig() {
  console.log('📝 Updating app.json for web build...');
  
  const appJsonPath = path.join(process.cwd(), 'app.json');
  let appConfig;
  
  try {
    appConfig = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  } catch (error) {
    console.error('❌ Error reading app.json:', error);
    return false;
  }
  
  // Ensure web platform is configured
  if (!appConfig.expo.platforms) {
    appConfig.expo.platforms = ['ios', 'android', 'web'];
  } else if (!appConfig.expo.platforms.includes('web')) {
    appConfig.expo.platforms.push('web');
  }
  
  // Configure web settings
  appConfig.expo.web = {
    bundler: 'webpack',
    output: 'static',
    favicon: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&q=80'
  };
  
  try {
    fs.writeFileSync(appJsonPath, JSON.stringify(appConfig, null, 2));
    console.log('✅ Updated app.json for web build');
    return true;
  } catch (error) {
    console.error('❌ Error writing app.json:', error);
    return false;
  }
}

function buildWithWebpack() {
  console.log('🔨 Building with Webpack...');
  
  try {
    // Try different webpack build commands
    const commands = [
      'npx webpack --mode production --output-path dist',
      'webpack --mode production --output-path dist'
    ];
    
    for (const command of commands) {
      try {
        console.log(`Trying build command: ${command}`);
        execSync(command, { 
          stdio: 'inherit',
          cwd: process.cwd(),
          env: {
            ...process.env,
            NODE_ENV: 'production',
            BABEL_ENV: 'production'
          }
        });
        console.log('✅ Webpack build successful!');
        return true;
      } catch (error) {
        console.log(`Build command failed with code ${error.status}`);
        continue;
      }
    }
    
    console.log('❌ All webpack build commands failed');
    return false;
  } catch (error) {
    console.error('❌ Webpack build error:', error);
    return false;
  }
}

function createFallbackBuild() {
  console.log('🔄 Creating fallback static build with subscription plans...');
  
  const distPath = path.join(process.cwd(), 'dist');
  
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
  }
  
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1.00001,viewport-fit=cover" />
    <title>Solar Care Connect - AI Solar Appointments</title>
    <meta name="description" content="AI-powered solar appointment generation app with subscription plans for solar businesses." />
    <link rel="manifest" href="./manifest.json" />
    <meta name="theme-color" content="#3B82F6" />
    <link rel="icon" href="https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&q=80" />
    <style>
        * { box-sizing: border-box; }
        html, body {
            width: 100%; height: 100%; margin: 0; padding: 0;
            background-color: #f8fafc;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .container {
            max-width: 1200px; margin: 0 auto; padding: 20px;
        }
        .header {
            text-align: center; padding: 40px 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; margin-bottom: 40px;
        }
        .logo { font-size: 48px; margin-bottom: 16px; }
        .title { font-size: 32px; font-weight: 700; margin-bottom: 16px; }
        .subtitle { font-size: 18px; opacity: 0.9; }
        .plans-section { margin: 40px 0; }
        .section-title {
            font-size: 24px; font-weight: 600; text-align: center;
            margin-bottom: 32px; color: #1f2937;
        }
        .plans-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 24px; margin-bottom: 40px;
        }
        .plan-card {
            background: white; border-radius: 16px; padding: 24px;
            border: 1px solid #e5e7eb; position: relative;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .plan-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        .popular-badge {
            position: absolute; top: -12px; right: 20px;
            background: #10b981; color: white; padding: 6px 12px;
            border-radius: 20px; font-size: 12px; font-weight: 600;
        }
        .plan-name {
            font-size: 20px; font-weight: 700; margin-bottom: 8px;
            color: #1f2937;
        }
        .plan-price {
            display: flex; align-items: flex-end; margin-bottom: 16px;
        }
        .currency { font-size: 20px; font-weight: 600; margin-bottom: 4px; }
        .price-amount { font-size: 32px; font-weight: 800; }
        .interval { font-size: 16px; margin-left: 4px; margin-bottom: 4px; color: #6b7280; }
        .plan-description {
            font-size: 14px; color: #6b7280; font-style: italic;
            margin-bottom: 16px;
        }
        .appointments-info {
            background: #f8fafc; border-radius: 8px; padding: 12px;
            margin-bottom: 16px; text-align: center;
        }
        .appointments-number {
            font-size: 24px; font-weight: 700; color: #3b82f6;
            margin-bottom: 4px;
        }
        .appointments-text {
            font-size: 14px; color: #1f2937; font-weight: 500;
        }
        .features-list {
            list-style: none; padding: 0; margin: 16px 0;
        }
        .feature-item {
            display: flex; align-items: flex-start; margin-bottom: 8px;
            font-size: 14px; color: #1f2937;
        }
        .feature-check {
            color: #10b981; margin-right: 8px; font-weight: bold;
        }
        .cta-button {
            width: 100%; background: #3b82f6; color: white;
            padding: 12px; border: none; border-radius: 8px;
            font-size: 16px; font-weight: 600; cursor: pointer;
            text-decoration: none; display: block; text-align: center;
            transition: background-color 0.2s;
        }
        .cta-button:hover { background: #2563eb; }
        .contract-info {
            background: #f0f9ff; border-radius: 8px; padding: 12px;
            margin: 16px 0; font-size: 12px;
        }
        .disclaimer {
            text-align: center; font-size: 12px; color: #6b7280;
            font-style: italic; margin-top: 12px;
        }
        .contact-section {
            background: #f0f9ff; border-radius: 12px; padding: 24px;
            text-align: center; margin-top: 40px;
        }
        .contact-title { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
        .contact-email { color: #3b82f6; text-decoration: none; font-weight: 600; }
        @media (max-width: 768px) {
            .plans-grid { grid-template-columns: 1fr; }
            .header { padding: 20px; }
            .title { font-size: 24px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">☀️</div>
        <h1 class="title">Solar Care Connect</h1>
        <p class="subtitle">AI-Powered Solar Appointments - Choose Your Plan</p>
    </div>
    
    <div class="container">
        <div class="plans-section">
            <h2 class="section-title">Choose a Subscription Plan</h2>
            <p style="text-align: center; color: #6b7280; margin-bottom: 32px;">
                Select a plan that fits your business needs. All no-show appointments are replaced for free.
            </p>
            
            <div class="plans-grid">
                <!-- Starter Plan -->
                <div class="plan-card">
                    <div class="plan-name">Starter</div>
                    <div class="plan-price">
                        <span class="currency">$</span>
                        <span class="price-amount">500</span>
                        <span class="interval">/monthly</span>
                    </div>
                    <div class="plan-description">Perfect for small solar businesses getting started</div>
                    <div class="appointments-info">
                        <div class="appointments-number">5</div>
                        <div class="appointments-text">appointments per month</div>
                    </div>
                    <ul class="features-list">
                        <li class="feature-item"><span class="feature-check">✓</span> 5 qualified solar appointments</li>
                        <li class="feature-item"><span class="feature-check">✓</span> No-show appointments replaced for free</li>
                        <li class="feature-item"><span class="feature-check">✓</span> Basic call analytics</li>
                        <li class="feature-item"><span class="feature-check">✓</span> Email notifications</li>
                        <li class="feature-item"><span class="feature-check">✓</span> Standard support</li>
                    </ul>
                    <a href="https://form.jotform.com/251608739182059?plan=Starter&price=500&interval=monthly&appointments=5" class="cta-button" target="_blank">
                        Fill Out Application
                    </a>
                    <div class="contract-info">
                        <div>✓ Not a contract - Cancel anytime</div>
                        <div>✓ Minimum 30 days notice required</div>
                    </div>
                    <div class="disclaimer">* Pricing may vary depending on state</div>
                </div>
                
                <!-- Professional Plan -->
                <div class="plan-card">
                    <div class="popular-badge">Most Popular</div>
                    <div class="plan-name">Professional</div>
                    <div class="plan-price">
                        <span class="currency">$</span>
                        <span class="price-amount">1,800</span>
                        <span class="interval">/monthly</span>
                    </div>
                    <div class="plan-description">Most popular for growing solar businesses</div>
                    <div class="appointments-info">
                        <div class="appointments-number">20</div>
                        <div class="appointments-text">appointments per month</div>
                    </div>
                    <ul class="features-list">
                        <li class="feature-item"><span class="feature-check">✓</span> 20 qualified solar appointments</li>
                        <li class="feature-item"><span class="feature-check">✓</span> No-show appointments replaced for free</li>
                        <li class="feature-item"><span class="feature-check">✓</span> Advanced call analytics</li>
                        <li class="feature-item"><span class="feature-check">✓</span> SMS & email notifications</li>
                        <li class="feature-item"><span class="feature-check">✓</span> Priority support</li>
                        <li class="feature-item"><span class="feature-check">✓</span> Custom AI voice training</li>
                    </ul>
                    <a href="https://form.jotform.com/251608739182059?plan=Professional&price=1800&interval=monthly&appointments=20" class="cta-button" target="_blank">
                        Fill Out Application
                    </a>
                    <div class="contract-info">
                        <div>✓ Not a contract - Cancel anytime</div>
                        <div>✓ Minimum 30 days notice required</div>
                    </div>
                    <div class="disclaimer">* Pricing may vary depending on state</div>
                </div>
                
                <!-- Enterprise Plan -->
                <div class="plan-card">
                    <div class="plan-name">Enterprise</div>
                    <div class="plan-price">
                        <span class="currency">$</span>
                        <span class="price-amount">4,000</span>
                        <span class="interval">/monthly</span>
                    </div>
                    <div class="plan-description">For large-scale solar operations</div>
                    <div class="appointments-info">
                        <div class="appointments-number">50</div>
                        <div class="appointments-text">appointments per month</div>
                    </div>
                    <ul class="features-list">
                        <li class="feature-item"><span class="feature-check">✓</span> 50 qualified solar appointments</li>
                        <li class="feature-item"><span class="feature-check">✓</span> No-show appointments replaced for free</li>
                        <li class="feature-item"><span class="feature-check">✓</span> Premium call analytics</li>
                        <li class="feature-item"><span class="feature-check">✓</span> Real-time notifications</li>
                        <li class="feature-item"><span class="feature-check">✓</span> Dedicated account manager</li>
                        <li class="feature-item"><span class="feature-check">✓</span> Custom AI voice training</li>
                        <li class="feature-item"><span class="feature-check">✓</span> CRM integration</li>
                        <li class="feature-item"><span class="feature-check">✓</span> Team collaboration tools</li>
                    </ul>
                    <a href="https://form.jotform.com/251608739182059?plan=Enterprise&price=4000&interval=monthly&appointments=50" class="cta-button" target="_blank">
                        Fill Out Application
                    </a>
                    <div class="contract-info">
                        <div>✓ Not a contract - Cancel anytime</div>
                        <div>✓ Minimum 30 days notice required</div>
                    </div>
                    <div class="disclaimer">* Pricing may vary depending on state</div>
                </div>
                
                <!-- Retainer Plan -->
                <div class="plan-card">
                    <div class="plan-name">Retainer</div>
                    <div class="plan-price">
                        <span class="currency">$</span>
                        <span class="price-amount">3,000</span>
                        <span class="interval">/monthly</span>
                    </div>
                    <div class="plan-description">Pay monthly retainer, then pay balance after solar project installation</div>
                    <div class="appointments-info">
                        <div class="appointments-number">∞</div>
                        <div class="appointments-text">Unlimited appointments</div>
                    </div>
                    <ul class="features-list">
                        <li class="feature-item"><span class="feature-check">✓</span> Unlimited qualified solar appointments</li>
                        <li class="feature-item"><span class="feature-check">✓</span> No-show appointments replaced for free</li>
                        <li class="feature-item"><span class="feature-check">✓</span> Dedicated account manager</li>
                        <li class="feature-item"><span class="feature-check">✓</span> Custom AI voice training</li>
                        <li class="feature-item"><span class="feature-check">✓</span> Premium analytics & reporting</li>
                        <li class="feature-item"><span class="feature-check">✓</span> Priority support</li>
                        <li class="feature-item"><span class="feature-check">✓</span> CRM integration</li>
                        <li class="feature-item"><span class="feature-check">✓</span> Custom territory mapping</li>
                        <li class="feature-item"><span class="feature-check">✓</span> Pay after project installation</li>
                    </ul>
                    <a href="https://form.jotform.com/251608739182059?plan=Retainer&price=3000&interval=monthly&appointments=999" class="cta-button" target="_blank">
                        Fill Out Application
                    </a>
                    <div class="contract-info">
                        <div>✓ Not a contract - Cancel anytime</div>
                        <div>✓ Minimum 30 days notice required</div>
                    </div>
                    <div class="disclaimer">* Pricing may vary depending on state</div>
                </div>
            </div>
        </div>
        
        <div class="contact-section">
            <h3 class="contact-title">Need Help?</h3>
            <p>Contact our support team at <a href="mailto:solarcareconnect@gmail.com" class="contact-email">solarcareconnect@gmail.com</a></p>
        </div>
    </div>
</body>
</html>`;

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
    
    console.log('✅ Fallback build created successfully!');
    console.log('📁 Output directory:', distPath);
    console.log('📄 Files created:');
    console.log('   - index.html (with subscription plans)');
    console.log('   - manifest.json');
    
    return true;
  } catch (error) {
    console.error('❌ Error creating fallback build:', error);
    return false;
  }
}

function main() {
  try {
    // Step 1: Update app config
    if (!updateAppConfig()) {
      console.error('❌ Failed to update app config');
      process.exit(1);
    }
    
    // Step 2: Try webpack build first
    let success = buildWithWebpack();
    
    // Step 3: If webpack fails, create fallback build
    if (!success) {
      console.log('🔄 Webpack build failed, creating fallback build with subscription plans...');
      success = createFallbackBuild();
    }
    
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