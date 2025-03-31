
// Ensure CryptoJS is loaded properly
if (typeof CryptoJS === "undefined") {
    console.error("❌ CryptoJS not loaded. Ensure it's included in your extension.");
}

// Wait until the popup is fully loaded
document.addEventListener("DOMContentLoaded", function () {
    const unlockButton = document.getElementById("unlock");
    const checkBalanceButton = document.getElementById("checkBalance");
    const sendTransactionButton = document.getElementById("sendTransaction");

    if (unlockButton) {
        unlockButton.addEventListener("click", function () {
            const password = document.getElementById("password").value;

            chrome.storage.local.get(["keystore"], function (result) {
                console.log("🔹 Retrieved Keystore:", result.keystore); // Debugging log

                if (!result.keystore) {
                    document.getElementById("result").innerText = "No wallet found!";
                    return;
                }

                try {
                    const keystore = JSON.parse(result.keystore);
                    console.log("🔹 Parsed Keystore:", keystore);

                    const encryptedPrivateKey = keystore.encryptedPrivateKey;
                    const bytes = CryptoJS.AES.decrypt(encryptedPrivateKey, password);
                    const privateKey = bytes.toString(CryptoJS.enc.Utf8);

                    if (!privateKey) {
                        console.error("❌ Incorrect Password");
                        document.getElementById("result").innerText = "Incorrect password!";
                        return;
                    }

                    console.log("✅ Wallet Unlocked:", keystore.address);
                    document.getElementById("result").innerText = "Wallet Unlocked! Address: " + keystore.address;
                    window.wallet = new ethers.Wallet(privateKey);
                } catch (error) {
                    console.error("❌ JSON Parsing or Decryption Error:", error);
                    document.getElementById("result").innerText = "Error unlocking wallet!";
                }
            });
        });
    } else {
        console.error("Button with ID 'unlock' not found.");
    }

    // ✅ Check Ethereum Balance
    if (checkBalanceButton) {
        checkBalanceButton.addEventListener("click", async function () {
            if (!window.wallet) {
                document.getElementById("balance").innerText = "Unlock wallet first!";
                return;
            }

            try {
                const provider = new ethers.providers.JsonRpcProvider("https://sepolia.infura.io/v3/e6aa79bb5e5441ac87ccbeef4223a0c2");
                const balance = await provider.getBalance(window.wallet.address);
                document.getElementById("balance").innerText = ethers.utils.formatEther(balance) ;
            } catch (error) {
                console.error("❌ Balance Check Failed:", error);
                document.getElementById("balance").innerText = "Failed to fetch balance!";
            }
        });
    }

    // ✅ Send ETH Transaction
    if (sendTransactionButton) {
        sendTransactionButton.addEventListener("click", async function () {
            if (!window.wallet) {
                document.getElementById("txResult").innerText = "Unlock wallet first!";
                return;
            }

            const to = document.getElementById("toAddress").value;
            const amountToSend = "0.00001"; // Set a very small amount for test transactions

            if (!ethers.utils.isAddress(to) || parseFloat(amountToSend) <= 0) {
                document.getElementById("txResult").innerText = "Invalid address or amount!";
                return;
            }

            try {
                const provider = new ethers.providers.JsonRpcProvider("https://sepolia.infura.io/v3/e6aa79bb5e5441ac87ccbeef4223a0c2");
                const walletConnected = window.wallet.connect(provider);

                const tx = await walletConnected.sendTransaction({
                    to,
                    value: ethers.utils.parseEther(amountToSend), // Send 0.00001 ETH
                    maxPriorityFeePerGas: ethers.utils.parseUnits("2", "gwei"), // Reduce priority fee
                    maxFeePerGas: ethers.utils.parseUnits("20", "gwei") // Reduce max gas fee
                });

                document.getElementById("txResult").innerText = "✅ Transaction Sent! TX Hash: " + tx.hash;
            } catch (error) {
                console.error("❌ Transaction Failed:", error);
                document.getElementById("txResult").innerText = "Transaction Failed!";
            }
        });
    }
});
