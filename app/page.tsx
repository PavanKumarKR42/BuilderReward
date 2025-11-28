'use client';

import { useEffect, useState } from 'react';
import { createConfig, connect, getAccount, http } from '@wagmi/core';
import { base } from '@wagmi/core/chains';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { sdk } from '@farcaster/miniapp-sdk';
import { APP_URL } from '../lib/constants';

export default function BuilderValueCalculator() {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddr, setWalletAddr] = useState('Not Connected');
  const [connectionStatus, setConnectionStatus] = useState('Not Connected');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');
  const [calculateDisabled, setCalculateDisabled] = useState(true);
  const [calculateText, setCalculateText] = useState('Connect Wallet First');
  const [showResult, setShowResult] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [theme, setTheme] = useState('dark');

  // API Configuration
  const NEYNAR_API_KEY = '20FEAD29-CB14-438B-8309-868BA126B594';
  const TALENT_API_KEY = '2026c36474af407746a5d5ca5afeae2db1b0116c8494e0698e72a69b3651';

  // Reward Pool Constants
  const TOTAL_REWARD_POOL = 100000000;
  const TIERS = {
    1: { maxRank: 2000, poolPercent: 0.60, poolAmount: 60000000, totalPoints: 400000 },
    2: { maxRank: 5000, poolPercent: 0.30, poolAmount: 30000000, totalPoints: 400000 },
    3: { maxRank: 10000, poolPercent: 0.10, poolAmount: 10000000, totalPoints: 500000 }
  };

  useEffect(() => {
    // Load theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
    }

    // Initialize Farcaster SDK
    const initializeSdk = async () => {
      try {
        const config = createConfig({
          chains: [base],
          transports: { [base.id]: http() }
        });

        await sdk.actions.ready({ disableNativeGestures: true });
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
            setIsConnected(true);
            const shortAddress = `${account.address.slice(0, 6)}...${account.address.slice(-4)}`;
            setWalletAddr(shortAddress);
            setConnectionStatus('✅ Connected');
            setCalculateDisabled(false);
            setCalculateText('🚀 Calculate My Value');
            console.log('Wallet connected:', account.address);
            showStatus(`✅ Connected: ${shortAddress}`, 'success');
            setTimeout(() => hideStatus(), 3000);
          } else {
            console.warn('No address found after connection attempt');
            showStatus('⚠️ Wallet not connected. Please reopen in Warpcast.', 'error');
          }

        } catch (err) {
          console.error('Wallet connection error:', err);
          showStatus('⚠️ Could not connect wallet. Please ensure you are using Warpcast app.', 'error');
        }

        // Auto-prompt to add app
        const hasPromptedAddApp = sessionStorage.getItem('hasPromptedAddApp');
        if (!hasPromptedAddApp) {
          try {
            console.log('Auto-prompting add app...');
            await sdk.actions.addMiniApp();
            sessionStorage.setItem('hasPromptedAddApp', 'true');
            console.log('App added successfully!');
          } catch (error) {
            console.log('Add app prompt dismissed or failed');
            sessionStorage.setItem('hasPromptedAddApp', 'true');
          }
        }

        // Store config and sdk in window for later use
        (window as any).wagmiConfig = config;
        (window as any).farcasterSdk = sdk;

      } catch (err) {
        console.error("SDK initialization failed:", err);
        showStatus('Failed to initialize. Please reopen in Warpcast.', 'error');
      }
    };

    initializeSdk();
  }, []);

  const showStatus = (message: string, type: string) => {
    setStatusMessage(message);
    setStatusType(type);
  };

  const hideStatus = () => {
    setStatusMessage('');
    setStatusType('');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', newTheme);
  };

  // Fetch Farcaster Profile from Neynar
  const fetchFarcasterProfile = async (address: string) => {
    try {
      const response = await fetch(
        `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${address}&address_types=custody_address,verified_address`,
        {
          headers: {
            'accept': 'application/json',
            'x-api-key': NEYNAR_API_KEY,
            'x-neynar-experimental': 'false'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Neynar API error: ${response.status}`);
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
  };

  // Fetch Builder Score from Talent Protocol
  const fetchBuilderScore = async (fidValue: number) => {
    try {
      const response = await fetch(
        `https://api.talentprotocol.com/farcaster/scores?fids=${fidValue}`,
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
        throw new Error(`Talent API error: ${response.status}`);
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
  };

  // Calculate Tier
  const getTier = (rank: number) => {
    if (rank <= TIERS[1].maxRank) return 1;
    if (rank <= TIERS[2].maxRank) return 2;
    if (rank <= TIERS[3].maxRank) return 3;
    return null;
  };

  // Calculate Builder Market Value
  const calculateReward = (score: number, rank: number) => {
    const tierNum = getTier(rank);
    if (!tierNum) return 0;

    const tierConfig = TIERS[tierNum as keyof typeof TIERS];
    const reward = (score / tierConfig.totalPoints) * tierConfig.poolAmount;
    return Math.round(reward);
  };

  // Format Currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleCalculate = async () => {
    if (!isConnected || !walletAddr || walletAddr === 'Not Connected') {
      showStatus('❌ Please connect your wallet first', 'error');
      return;
    }

    setCalculateDisabled(true);
    setCalculateText('Calculating...');
    setShowResult(false);
    hideStatus();

    try {
      const config = (window as any).wagmiConfig;
      const { getAccount } = await import('@wagmi/core');
      const account = getAccount(config);
      const currentAddress = account?.address;

      if (!currentAddress) {
        throw new Error('Wallet not connected');
      }

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
        setUserData({
          noReward: true,
          message: "You don't have a Builder Score yet or your rank is outside the Top 10,000."
        });
        setShowResult(true);
        showStatus('No reward available for this profile', 'error');
        setCalculateDisabled(false);
        setCalculateText('🔄 Try Again');
        return;
      }

      const userScore = builderData.score;
      const userRank = builderData.rank;

      // Step 3: Check if rank qualifies for reward
      if (userRank > 10000) {
        setUserData({
          noReward: true,
          message: `Your current rank is ${userRank.toLocaleString()}, which is outside the Top 10,000.`
        });
        setShowResult(true);
        showStatus('Rank outside reward range', 'error');
        setCalculateDisabled(false);
        setCalculateText('🔄 Try Again');
        return;
      }

      // Step 4: Calculate Reward
      showStatus('<span class="loader"></span>Calculating your market value...', 'loading');
      const reward = calculateReward(userScore, userRank);
      const userTier = getTier(userRank);

      // Step 5: Display Results
      const newUserData = {
        fid: userFid,
        username: userUsername,
        displayName: userDisplayName,
        pfpUrl: profile.pfpUrl || `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="70" height="70"%3E%3Crect width="70" height="70" rx="35" fill="%236c5ce7"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="30" fill="white"%3E${userDisplayName.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E`,
        score: userScore,
        rank: userRank,
        tier: userTier,
        reward: reward
      };

      setUserData(newUserData);
      setShowResult(true);
      showStatus('✅ Calculation complete!', 'success');
      setTimeout(() => hideStatus(), 3000);

    } catch (error: any) {
      console.error('Calculation error:', error);
      showStatus(`❌ Error: ${error.message}`, 'error');
    } finally {
      setCalculateDisabled(false);
      setCalculateText('🔄 Recalculate');
    }
  };

  const handleShare = async () => {
    if (!userData) return;

    try {
      showStatus('<span class="loader"></span>Opening cast composer...', 'loading');

      const sdk = (window as any).farcasterSdk;
      const shareUrl = `${APP_URL}/share/${userData.fid}`;

      await sdk.actions.composeCast({
        text: `💎 My Builder Market Value: ${formatCurrency(userData.reward)}!\n\n🏆 Rank: #${userData.rank.toLocaleString()}\n⚡ Score: ${userData.score.toLocaleString()}\n🎯 Tier ${userData.tier}\n\nCalculate your worth from the $100M reward pool! 🚀`,
        embeds: [shareUrl]
      });

      showStatus('Cast composer opened!', 'success');
      setTimeout(() => hideStatus(), 3000);
    } catch (error) {
      console.error('Share error:', error);
      showStatus('Failed to open cast composer', 'error');
    }
  };

  return (
    <>
      <button 
        className="theme-toggle" 
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? '🌙' : '☀️'}
      </button>

      <div className="container">
        <div className="header">
          <h1>Builder Value</h1>
          <div className="subtitle">Calculate Your Market Worth</div>
        </div>

        <div className="wallet-section">
          <div className="wallet-row">
            <span className="wallet-label">Status:</span>
            <span className="wallet-value">{connectionStatus}</span>
          </div>
          <div className="wallet-row">
            <span className="wallet-label">Wallet:</span>
            <span className="wallet-value">{walletAddr}</span>
          </div>
        </div>

        <button 
          className="calculate-btn" 
          onClick={handleCalculate}
          disabled={calculateDisabled}
        >
          {calculateText}
        </button>

        {showResult && userData && (
          <div className="result-container show">
            {userData.noReward ? (
              <div className="no-reward">
                <div className="no-reward-title">😔 No Reward Available</div>
                <div className="no-reward-text">
                  {userData.message}
                  <br /><br />
                  {userData.message.includes("outside the Top 10,000") 
                    ? "Keep building to improve your rank and qualify for rewards!"
                    : "Start building on Talent Protocol to earn your place!"}
                </div>
              </div>
            ) : (
              <>
                <div className="profile-header">
                  <img className="profile-pfp" src={userData.pfpUrl} alt="Profile" />
                  <div className="profile-name">{userData.displayName}</div>
                  <div className="profile-username">@{userData.username}</div>
                </div>

                <div className="value-display">
                  <div className="value-label">Your Builder Market Value</div>
                  <div className="value-amount">{formatCurrency(userData.reward)}</div>
                </div>

                <div className="stats-grid">
                  <div className="stat-box">
                    <div className="stat-label">Builder Score</div>
                    <div className="stat-value">{userData.score.toLocaleString()}</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Rank</div>
                    <div className="stat-value">#{userData.rank.toLocaleString()}</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">FID</div>
                    <div className="stat-value">{userData.fid}</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Tier</div>
                    <div className="stat-value">
                      <span className={`tier-badge tier-${userData.tier}`}>
                        Tier {userData.tier}
                      </span>
                    </div>
                  </div>
                </div>

                <button className="share-btn" onClick={handleShare}>
                  📢 Share Your Value on Farcaster
                </button>
              </>
            )}
          </div>
        )}

        {statusMessage && (
          <div className={`status show ${statusType}`} dangerouslySetInnerHTML={{ __html: statusMessage }} />
        )}

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
              Your value may be $0 if you haven't ranked within the Top 10,000 builders or
              haven't connected your Farcaster account to Talent Protocol yet.
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
    </>
  );
}