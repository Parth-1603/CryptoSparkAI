import zipfile
import shutil
from pathlib import Path

raw_dir = Path("dataset/raw")
alt_dir = raw_dir / "altcoins"

print("Extracting datasets...")

# 1. Extract BTC
btc_zip = raw_dir / "bitcoin-historical-data.zip"
if btc_zip.exists():
    with zipfile.ZipFile(btc_zip, "r") as z:
        print(f"BTC zip contents: {z.namelist()}")
        for member in z.namelist():
            if member.endswith(".csv"):
                z.extract(member, raw_dir)
                extracted = raw_dir / member
                target = raw_dir / "btc_raw.csv"
                if target.exists():
                    target.unlink()
                extracted.rename(target)
                print(f"[OK] Extracted & renamed BTC dataset -> {target}")

# 2. Extract Altcoins
alt_zip = alt_dir / "cryptocurrencypricehistory.zip"
if alt_zip.exists():
    mappings = {
        "coin_Ethereum.csv": raw_dir / "eth_raw.csv",
        "coin_Solana.csv": raw_dir / "sol_raw.csv",
        "coin_Cardano.csv": raw_dir / "ada_raw.csv"
    }
    with zipfile.ZipFile(alt_zip, "r") as z:
        for src_name, dest_path in mappings.items():
            if src_name in z.namelist():
                z.extract(src_name, alt_dir)
                src = alt_dir / src_name
                if dest_path.exists():
                    dest_path.unlink()
                src.rename(dest_path)
                print(f"[OK] Extracted & renamed {src_name} -> {dest_path}")

print("All datasets extracted and organized successfully!")
