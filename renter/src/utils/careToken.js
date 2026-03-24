import { Contract, JsonRpcProvider, Wallet } from 'ethers'

// TODO: 실제 배포된 CareToken 컨트랙트 주소로 변경
export const CARE_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000'
export const RPC_URL = 'https://rpc.ssafy-blockchain.com'
export const FAUCET_AMOUNT = 100 // CARE 단위 (decimals=6)

const ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function faucet(address to, uint256 amount) external',
  'function decimals() pure returns (uint8)',
]

export async function getCareBalance(address) {
  const provider = new JsonRpcProvider(RPC_URL)
  const contract = new Contract(CARE_TOKEN_ADDRESS, ABI, provider)
  const raw = await contract.balanceOf(address)
  return (Number(raw) / 1_000_000).toFixed(2) // decimals = 6
}

export async function callFaucet(privateKey, toAddress) {
  const provider = new JsonRpcProvider(RPC_URL)
  const signer = new Wallet(privateKey, provider)
  const contract = new Contract(CARE_TOKEN_ADDRESS, ABI, signer)
  const tx = await contract.faucet(toAddress, BigInt(FAUCET_AMOUNT) * 1_000_000n)
  await tx.wait()
  return tx
}

// ── 토큰 사용 내역 (localStorage) ──────────────────────────────
const HISTORY_KEY = 'care_token_history'

export function addTokenHistory({ type, amount, desc, txHash }) {
  const prev = getTokenHistory()
  const entry = {
    type,       // 'charge' | 'payment'
    amount,
    desc,
    txHash: txHash || null,
    date: new Date().toISOString(),
  }
  localStorage.setItem(HISTORY_KEY, JSON.stringify([entry, ...prev]))
}

export function getTokenHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch {
    return []
  }
}
