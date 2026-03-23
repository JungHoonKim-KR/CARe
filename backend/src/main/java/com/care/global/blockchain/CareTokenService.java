package com.care.global.blockchain;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.RawTransaction;
import org.web3j.crypto.TransactionEncoder;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.Transaction;
import org.web3j.protocol.core.methods.response.EthCall;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.utils.Numeric;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Lazy
@Slf4j
@Service
public class CareTokenService {

    private final Web3j web3j;
    private final Credentials credentials;

    @Value("${blockchain.contracts.mock-usdc}")
    private String careTokenAddress;

    @Value("${blockchain.chain-id}")
    private long chainId;

    // 1 CARE = 1_000_000 (decimals: 6)
    public static BigInteger toCare(double amount) {
        return BigInteger.valueOf((long) (amount * 1_000_000));
    }

    public CareTokenService(Web3j web3j, Credentials credentials) {
        this.web3j = web3j;
        this.credentials = credentials;
    }

    /**
     * 토큰 충전 — faucet(address to, uint256 amount)
     */
    public String faucet(String toAddress, double amount) throws Exception {
        Function function = new Function(
                "faucet",
                Arrays.asList(new Address(toAddress), new Uint256(toCare(amount))),
                Collections.emptyList()
        );
        String txHash = sendFunction(function);
        log.info("[CareToken] faucet {} CARE → {} txHash: {}", amount, toAddress, txHash);
        return txHash;
    }

    /**
     * 잔액 조회 — balanceOf(address)
     */
    public BigInteger balanceOf(String address) throws Exception {
        Function function = new Function(
                "balanceOf",
                Collections.singletonList(new Address(address)),
                Collections.singletonList(new TypeReference<Uint256>() {})
        );

        String encoded = FunctionEncoder.encode(function);
        EthCall response = web3j.ethCall(
                Transaction.createEthCallTransaction(credentials.getAddress(), careTokenAddress, encoded),
                DefaultBlockParameterName.LATEST
        ).send();

        List<org.web3j.abi.datatypes.Type> result =
                FunctionReturnDecoder.decode(response.getValue(), function.getOutputParameters());

        return result.isEmpty() ? BigInteger.ZERO : (BigInteger) result.get(0).getValue();
    }

    // ── 내부: Raw Transaction 서명 후 전송 ──────────────────────────────────
    private String sendFunction(Function function) throws Exception {
        String encoded = FunctionEncoder.encode(function);

        BigInteger nonce = web3j
                .ethGetTransactionCount(credentials.getAddress(), DefaultBlockParameterName.PENDING)
                .send()
                .getTransactionCount();

        BigInteger gasPrice = web3j.ethGasPrice().send().getGasPrice();
        BigInteger gasLimit = BigInteger.valueOf(100_000);

        RawTransaction rawTx = RawTransaction.createTransaction(
                nonce, gasPrice, gasLimit, careTokenAddress, BigInteger.ZERO, encoded);

        byte[] signed = TransactionEncoder.signMessage(rawTx, chainId, credentials);
        EthSendTransaction response = web3j.ethSendRawTransaction(Numeric.toHexString(signed)).send();

        if (response.hasError()) {
            throw new RuntimeException("TX error: " + response.getError().getMessage());
        }
        return response.getTransactionHash();
    }
}
