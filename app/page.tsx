'use client';

import { useEffect, useState } from 'react';

export default function BuilderValueCalculator() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <>
      <button className="theme-toggle" id="themeToggle" aria-label="Toggle theme">
        🌙
      </button>

      <div className="container">
        <div className="header">
          <h1>Builder Value</h1>
          <div className="subtitle">Calculate Your Market Worth</div>
        </div>

        <div className="wallet-section">
          <div className="wallet-row">
            <span className="wallet-label">Status:</span>
            <span className="wallet-value" id="connectionStatus">
              Not Connected
            </span>
          </div>
          <div className="wallet-row">
            <span className="wallet-label">Wallet:</span>
            <span className="wallet-value" id="walletAddress">
              —
            </span>
          </div>
        </div>

        <button className="calculate-btn" id="calculateBtn" disabled>
          Connect Wallet First
        </button>

        <div className="result-container" id="resultContainer">
          <div className="profile-header">
            <img className="profile-pfp" id="profilePfp" src="" alt="Profile" />
            <div className="profile-name" id="displayName">
              —
            </div>
            <div className="profile-username" id="username">
              —
            </div>
          </div>

          <div className="value-display">
            <div className="value-label">Your Builder Market Value</div>
            <div className="value-amount" id="rewardAmount">
              $0
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-label">Builder Score</div>
              <div className="stat-value" id="builderScore">
                —
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Rank</div>
              <div className="stat-value" id="builderRank">
                —
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-label">FID</div>
              <div className="stat-value" id="fid">
                —
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Tier</div>
              <div className="stat-value" id="tier">
                —
              </div>
            </div>
          </div>

          <button className="share-btn" id="shareBtn">
            📢 Share Your Value on Farcaster
          </button>
        </div>

        <div className="status" id="status"></div>

        <div className="info-section">
          <div className="info-title">ℹ️ Important Information</div>

          <div className="info-item">
            <div className="info-question">What is Builder Score?</div>
            <div className="info-answer">
              Builder Score is a comprehensive metric assigned to on-chain builders by Talent
              Protocol, reflecting their contributions, reputation, and activity within the Web3
              ecosystem.
            </div>
          </div>

          <div className="info-item">
            <div className="info-question">Why is my value $0?</div>
            <div className="info-answer">
              Your value may be $0 if you haven&apos;t ranked within the Top 10,000 builders or
              haven&apos;t connected your Farcaster account to Talent Protocol yet.
            </div>
          </div>

          <div className="info-item">
            <div className="info-question">How to improve your value?</div>
            <div className="info-answer">
              Actively build on-chain projects, complete quests on Talent Protocol, contribute to
              the ecosystem, and engage with the builder community to increase your score and
              ranking.
            </div>
          </div>
        </div>

        <div className="footer">
          Built with ❤️ for Builders |{' '}
          <a
            href="https://farcaster.xyz/pavankumarkr"
            target="_blank"
            rel="noopener noreferrer"
          >
            Built by @pavankumarkr
          </a>
        </div>
      </div>

      <script
        type="module"
        dangerouslySetInnerHTML={{
          __html: `
            import { sdk } from 'https://esm.sh/@farcaster/miniapp-sdk';
            import {
              createConfig, connect, switchChain, getAccount, http
            } from 'https://esm.sh/@wagmi/core';
            import { base } from 'https://esm.sh/@wagmi/core/chains';
            import { farcasterMiniApp } from 'https://esm.sh/@farcaster/miniapp-wagmi-connector';
                
            sdk.actions.ready({ disableNativeGestures: true })
              .then(async () => {
                console.log("Farcaster MiniApp SDK ready!");
                showStatus('App ready! Connecting wallet...', 'loading');
                
                try {
                  let account = getAccount(config);
                  
                  if (!account?.address) {
                    const result = await connect(config, {
                      connector: farcasterMiniApp(),
                      chainId: base.id
                    });
                    console.log('Connection result:', result);
                    account = getAccount(config);
                  }
                  
                  if (account?.address) {
                    isConnected = true;
                    currentAddress = account.address;
                    const shortAddress = \`\${account.address.slice(0, 6)}...\${account.address.slice(-4)}\`;
                    walletAddress.textContent = shortAddress;
                    connectionStatus.textContent = '✅ Connected';
                    calculateBtn.disabled = false;
                    calculateBtn.textContent = '🚀 Calculate My Value';
                    console.log('Wallet connected:', account.address);
                    showStatus(\`✅ Connected: \${shortAddress}\`, 'success');
                    setTimeout(() => hideStatus(), 3000);
                  } else {
                    console.warn('No address found after connection attempt');
                    showStatus('⚠️ Wallet not connected. Please reopen in Warpcast.', 'error');
                  }

                } catch (err) {
                  console.error('Wallet connection error:', err);
                  showStatus('⚠️ Could not connect wallet. Please ensure you are using Warpcast app.', 'error');
                }

            // API Configuration
            const NEYNAR_API_KEY = '20FEAD29-CB14-438B-8309-868BA126B594';
            const TALENT_API_KEY = '2026c36474af407746a5d5ca5afeae2db1b0116c8494e0698e72a69b3651';

            // Reward Pool Constants
            const TOTAL_REWARD_POOL = 100000000;
            const TOTAL_SYSTEM_POINTS = 1300000;

            // Tier Configuration
            const TIERS = {
              1: { maxRank: 2000, poolPercent: 0.60, poolAmount: 60000000, totalPoints: 400000 },
              2: { maxRank: 5000, poolPercent: 0.30, poolAmount: 30000000, totalPoints: 400000 },
              3: { maxRank: 10000, poolPercent: 0.10, poolAmount: 10000000, totalPoints: 500000 }
            };

            const config = createConfig({
              chains: [base],
              transports: { [base.id]: http() }
            });

            // DOM Elements
            const themeToggle = document.getElementById('themeToggle');
            const connectionStatus = document.getElementById('connectionStatus');
            const walletAddress = document.getElementById('walletAddress');
            const calculateBtn = document.getElementById('calculateBtn');
            const resultContainer = document.getElementById('resultContainer');
            const profilePfp = document.getElementById('profilePfp');
            const displayName = document.getElementById('displayName');
            const username = document.getElementById('username');
            const rewardAmount = document.getElementById('rewardAmount');
            const builderScore = document.getElementById('builderScore');
            const builderRank = document.getElementById('builderRank');
            const fid = document.getElementById('fid');
            const tier = document.getElementById('tier');
            const shareBtn = document.getElementById('shareBtn');
            const statusDiv = document.getElementById('status');

            // State
            let isConnected = false;
            let currentAddress = null;
            let userData = null;

            // Theme Toggle
            const savedTheme = localStorage.getItem('theme') || 'dark';
            if (savedTheme === 'light') {
              document.body.classList.add('light-mode');
              themeToggle.textContent = '☀️';
            }

            themeToggle.addEventListener('click', () => {
              document.body.classList.toggle('light-mode');
              const isLight = document.body.classList.contains('light-mode');
              themeToggle.textContent = isLight ? '☀️' : '🌙';
              localStorage.setItem('theme', isLight ? 'light' : 'dark');
            });

            // Status Functions
            function showStatus(message, type) {
              statusDiv.innerHTML = message;
              statusDiv.className = \`status show \${type}\`;
            }

            function hideStatus() {
              statusDiv.classList.remove('show');
            }

            // Initialize Farcaster SDK
            console.log('Initializing Farcaster SDK...');
        
                // Auto-prompt to add app
                const hasPromptedAddApp = sessionStorage.getItem('hasPromptedAddApp');
                if (!hasPromptedAddApp) {
                  try {
                    console.log('Auto-prompting add app...');
                    await sdk.actions.addMiniApp();
                    sessionStorage.setItem('hasPromptedAddApp', 'true');
                    console.log('App added successfully!');
                  } catch (error) {
                    console.log('Add app prompt dismissed or failed:', error.name);
                    sessionStorage.setItem('hasPromptedAddApp', 'true');
                  }
                }

              })
              .catch(err => {
                console.error("SDK initialization failed:", err);
                showStatus('Failed to initialize. Please reopen in Warpcast.', 'error');
              });

            // Fetch Farcaster Profile from Neynar
            async function fetchFarcasterProfile(address) {
              try {
                const response = await fetch(
                  \`https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=\${address}&address_types=custody_address,verified_address\`,
                  {
                    headers: {
                      'accept': 'application/json',
                      'x-api-key': NEYNAR_API_KEY,
                      'x-neynar-experimental': 'false'
                    }
                  }
                );

                if (!response.ok) {
                  throw new Error(\`Neynar API error: \${response.status}\`);
                }

                const data = await response.json();
                console.log('Neynar response:', data);

                const users = data[address.toLowerCase()];
                if (!users || users.length === 0) {
                  throw new Error('No Farcaster profile found for this address');
                }

                const user = users[0];
                
                return {
                  fid: user.fid,
                  username: user.username,
                  displayName: user.display_name || user.username,
                  pfpUrl: user.pfp_url || '',
                  followerCount: user.follower_count || 0,
                  followingCount: user.following_count || 0,
                  score: user.score || 0
                };
              } catch (error) {
                console.error('Neynar fetch error:', error);
                throw error;
              }
            }

            // Fetch Builder Score from Talent Protocol
            async function fetchBuilderScore(fidValue) {
              try {
                const response = await fetch(
                  \`https://api.talentprotocol.com/farcaster/scores?fids=\${fidValue}\`,
                  {
                    headers: {
                      'accept': 'application/json',
                      'X-API-KEY': TALENT_API_KEY
                    }
                  }
                );

                if (!response.ok) {
                  if (response.status === 404 || response.status === 401) {
                    return null;
                  }
                  throw new Error(\`Talent API error: \${response.status}\`);
                }

                const data = await response.json();
                console.log('Talent Protocol response:', data);

                if (!data.scores || data.scores.length === 0) {
                  return null;
                }

                const scoreData = data.scores[0];

                return {
                  score: scoreData.points || 0,
                  rank: scoreData.rank_position || null,
                  lastCalculated: scoreData.last_calculated_at,
                  slug: scoreData.slug
                };
              } catch (error) {
                console.error('Talent Protocol fetch error:', error);
                throw error;
              }
            }

            // Calculate Tier
            function getTier(rank) {
              if (rank <= TIERS[1].maxRank) return 1;
              if (rank <= TIERS[2].maxRank) return 2;
              if (rank <= TIERS[3].maxRank) return 3;
              return null;
            }

            // Calculate Builder Market Value
            function calculateReward(score, rank) {
              const tierNum = getTier(rank);
              if (!tierNum) return 0;

              const tierConfig = TIERS[tierNum];
              const reward = (score / tierConfig.totalPoints) * tierConfig.poolAmount;
              return Math.round(reward);
            }

            // Format Currency
            function formatCurrency(amount) {
              return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(amount);
            }

            // Calculate Button Handler
            calculateBtn.addEventListener('click', async () => {
              if (!isConnected || !currentAddress) {
                showStatus('❌ Please connect your wallet first', 'error');
                return;
              }

              calculateBtn.disabled = true;
              calculateBtn.textContent = 'Calculating...';
              resultContainer.classList.remove('show');
              hideStatus();

              try {
                // Step 1: Fetch Farcaster Profile
                showStatus('<span class="loader"></span>Fetching your Farcaster profile...', 'loading');
                const profile = await fetchFarcasterProfile(currentAddress);
                
                const userFid = profile.fid;
                const userUsername = profile.username;
                const userDisplayName = profile.displayName;

                console.log('Profile data:', { userFid, userUsername, userDisplayName });

                // Step 2: Fetch Builder Score
                showStatus('<span class="loader"></span>Fetching your Builder Score...', 'loading');
                const builderData = await fetchBuilderScore(userFid);

                if (!builderData || !builderData.rank) {
                  resultContainer.innerHTML = \`
                    <div class="no-reward">
                      <div class="no-reward-title">😔 No Reward Available</div>
                      <div class="no-reward-text">
                        You don't have a Builder Score yet or your rank is outside the Top 10,000.
                        <br><br>
                        Start building on Talent Protocol to earn your place!
                      </div>
                    </div>
                  \`;
                  resultContainer.classList.add('show');
                  showStatus('No reward available for this profile', 'error');
                  calculateBtn.disabled = false;
                  calculateBtn.textContent = '🔄 Try Again';
                  return;
                }

                const userScore = builderData.score;
                const userRank = builderData.rank;

                // Step 3: Check if rank qualifies for reward
                if (userRank > 10000) {
                  resultContainer.innerHTML = \`
                    <div class="no-reward">
                      <div class="no-reward-title">😔 No Reward Available</div>
                      <div class="no-reward-text">
                        Your current rank is \${userRank.toLocaleString()}, which is outside the Top 10,000.
                        <br><br>
                        Keep building to improve your rank and qualify for rewards!
                      </div>
                    </div>
                  \`;
                  resultContainer.classList.add('show');
                  showStatus('Rank outside reward range', 'error');
                  calculateBtn.disabled = false;
                  calculateBtn.textContent = '🔄 Try Again';
                  return;
                }

                // Step 4: Calculate Reward
                showStatus('<span class="loader"></span>Calculating your market value...', 'loading');
                const reward = calculateReward(userScore, userRank);
                const userTier = getTier(userRank);

                // Step 5: Display Results
                userData = {
                  fid: userFid,
                  username: userUsername,
                  displayName: userDisplayName,
                  pfpUrl: profile.pfpUrl,
                  score: userScore,
                  rank: userRank,
                  tier: userTier,
                  reward: reward
                };

                // Set profile image
                if (profile.pfpUrl) {
                  profilePfp.src = profile.pfpUrl;
                  profilePfp.style.display = 'block';
                } else {
                  profilePfp.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="70" height="70"%3E%3Crect width="70" height="70" rx="35" fill="%236c5ce7"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="30" fill="white"%3E' + userDisplayName.charAt(0).toUpperCase() + '%3C/text%3E%3C/svg%3E';
                  profilePfp.style.display = 'block';
                }

                displayName.textContent = userDisplayName;
                username.textContent = \`@\${userUsername}\`;
                rewardAmount.textContent = formatCurrency(reward);
                builderScore.textContent = userScore.toLocaleString();
                builderRank.textContent = \`#\${userRank.toLocaleString()}\`;
                fid.textContent = userFid;
                
                const tierBadge = document.createElement('span');
                tierBadge.className = \`tier-badge tier-\${userTier}\`;
                tierBadge.textContent = \`Tier \${userTier}\`;
                tier.innerHTML = '';
                tier.appendChild(tierBadge);

                resultContainer.classList.add('show');
                showStatus('✅ Calculation complete!', 'success');
                setTimeout(() => hideStatus(), 3000);

              } catch (error) {
                console.error('Calculation error:', error);
                showStatus(\`❌ Error: \${error.message}\`, 'error');
              } finally {
                calculateBtn.disabled = false;
                calculateBtn.textContent = '🔄 Recalculate';
              }
            });

            // Share Button Handler
            shareBtn.addEventListener('click', async () => {
              if (!userData) return;

              try {
                shareBtn.disabled = true;
                showStatus('<span class="loader"></span>Opening cast composer...', 'loading');

                await sdk.actions.composeCast({
                  text: \`💎 My Builder Market Value: \${formatCurrency(userData.reward)}!

🏆 Rank: #\${userData.rank.toLocaleString()}
⚡ Score: \${userData.score.toLocaleString()}
🎯 Tier \${userData.tier}

Calculate your worth from the $100M reward pool! 🚀\`,
                  embeds: ["https://builder-reward.vercel.app/"]
                });

                showStatus('Cast composer opened!', 'success');
                setTimeout(() => hideStatus(), 3000);
              } catch (error) {
                console.error('Share error:', error);
                showStatus('Failed to open cast composer', 'error');
              } finally {
                shareBtn.disabled = false;
              }
            });
          `,
        }}
      />
    </>
  );
}