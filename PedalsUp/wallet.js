
const bip39 = require("bip39");
const { hdkey } = require("ethereumjs-wallet");
const ethers = require("ethers");
const CryptoJS = require("crypto-js");
const fs = require("fs");

// 1️⃣ Generate a NEW Seed Phrase
const seedPhrase = bip39.generateMnemonic();
console.log("🔹 Seed Phrase:", seedPhrase);

// 2️⃣ Create Private Key from Seed
const seed = bip39.mnemonicToSeedSync(seedPhrase);
const hdWallet = hdkey.fromMasterSeed(seed);
const wallet = hdWallet.derivePath("m/44'/60'/0'/0/0").getWallet();
const privateKey = wallet.getPrivateKeyString();
console.log("🔹 Private Key (Before Encryption):", privateKey);

// // 3️⃣ Encrypt Private Key with a Password
// const password = "123456"; // ⚠️ Change this for security
// const encryptedPrivateKey = CryptoJS.AES.encrypt(privateKey, password).toString();
// console.log("🔹 Encrypted Private Key:", encryptedPrivateKey);
const encryptedPrivateKey = "U2FsdGVkX18m/IH4OrI0J4b/Wd71dGZSTgp/2IgwaM1yc2D5R+1SCSOQ7AXqQeFoH+uqbZPvJO1JSE3wK/00JkFQ1YrmmR/kRxvjxoBohrS2ZnEGu06/FoZoHZYSBfPo";
const password = "123456"; // Use your real password

try {
    const bytes = CryptoJS.AES.decrypt(encryptedPrivateKey, password);
    const privateKey = bytes.toString(CryptoJS.enc.Utf8);
    console.log("🔑 Decrypted Private Key:", privateKey);
} catch (error) {
    console.error("❌ Decryption Error:", error);
}


// 4️⃣ Generate Ethereum Address
const address = wallet.getAddressString();
console.log("🔹 Ethereum Address:", address);

// 5️⃣ Save Keystore JSON
const keystore = {
  address: address,
  encryptedPrivateKey: encryptedPrivateKey,
  seedPhrase: seedPhrase, // ⚠️ Storing seed is insecure in production
};
try {
    fs.writeFileSync("./wallet-keystore.json", JSON.stringify(keystore, null, 2));
    console.log("✅ Keystore saved to: ./wallet-keystore.json");
} catch (error) {
    console.error("❌ Failed to write keystore file:", error);
}

