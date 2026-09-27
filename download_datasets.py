import os
import sys
import shutil
from pathlib import Path

# Ensure user site-packages is in sys.path if needed
import site
user_site = site.getusersitepackages()
if user_site not in sys.path:
    sys.path.append(user_site)

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def setup_kaggle_credentials(username=None, key=None):
    user_home = Path.home()
    kaggle_dir = user_home / ".kaggle"
    kaggle_json_home = kaggle_dir / "kaggle.json"
    access_token_home = kaggle_dir / "access_token"
    downloads_dir = user_home / "Downloads"
    kaggle_json_downloads = downloads_dir / "kaggle.json"

    kaggle_dir.mkdir(parents=True, exist_ok=True)

    # If key starts with KGAT_ or token provided, save to access_token
    if key and key.startswith("KGAT_"):
        with open(access_token_home, "w") as f:
            f.write(key.strip())
        print(f"[OK] Saved Kaggle access token to {access_token_home}")
        os.environ["KAGGLE_API_TOKEN"] = key.strip()
    elif username and key:
        import json
        with open(kaggle_json_home, "w") as f:
            json.dump({"username": username, "key": key}, f, indent=2)
        print(f"[OK] Created kaggle.json at {kaggle_json_home}")

    if not kaggle_json_home.exists() and kaggle_json_downloads.exists():
        shutil.move(str(kaggle_json_downloads), str(kaggle_json_home))
        print(f"[OK] Moved kaggle.json from {kaggle_json_downloads} to {kaggle_json_home}")

    if os.name != 'nt':
        if kaggle_json_home.exists(): os.chmod(kaggle_json_home, 0o600)
        if access_token_home.exists(): os.chmod(access_token_home, 0o600)

    has_auth = (
        kaggle_json_home.exists() or 
        access_token_home.exists() or 
        os.environ.get("KAGGLE_API_TOKEN") or
        (os.environ.get("KAGGLE_USERNAME") and os.environ.get("KAGGLE_KEY"))
    )

    if not has_auth:
        print(f"[!] Kaggle credentials not found in {kaggle_dir}")
        print("Please provide your Kaggle token / username.")
        return False
    
    return True

def download_datasets(username=None, key=None):
    raw_dir = Path("dataset/raw")
    altcoins_dir = raw_dir / "altcoins"

    raw_dir.mkdir(parents=True, exist_ok=True)
    altcoins_dir.mkdir(parents=True, exist_ok=True)

    if not setup_kaggle_credentials(username=username, key=key):
        sys.exit(1)

    from kaggle.api.kaggle_api_extended import KaggleApi

    api = KaggleApi()
    print("Authenticating with Kaggle API...")
    api.authenticate()

    print("\n[1/2] Downloading Bitcoin historical dataset...")
    api.dataset_download_files("mczielinski/bitcoin-historical-data", path=str(raw_dir), unzip=True)

    btc_target = raw_dir / "btc_raw.csv"
    bitstamp_files = list(raw_dir.glob("*bitstampUSD*"))
    for file in bitstamp_files:
        if btc_target.exists():
            btc_target.unlink()
        file.rename(btc_target)
        print(f"[OK] Formatted: {file.name} -> {btc_target}")

    print("\n[2/2] Downloading Altcoins dataset (ETH, SOL, ADA)...")
    api.dataset_download_files("sudalairajkumar/cryptocurrencypricehistory", path=str(altcoins_dir), unzip=True)

    mappings = {
        "coin_Ethereum.csv": raw_dir / "eth_raw.csv",
        "coin_Solana.csv": raw_dir / "sol_raw.csv",
        "coin_Cardano.csv": raw_dir / "ada_raw.csv"
    }

    for src_name, dest_path in mappings.items():
        src_path = altcoins_dir / src_name
        if src_path.exists():
            if dest_path.exists():
                dest_path.unlink()
            shutil.move(str(src_path), str(dest_path))
            print(f"[OK] Formatted: {src_name} -> {dest_path}")

    print("\n[SUCCESS] All datasets downloaded and formatted successfully!")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Download Kaggle datasets for CryptoSparkAI")
    parser.add_argument("--username", help="Kaggle Username")
    parser.add_argument("--key", help="Kaggle API Key")
    args = parser.parse_args()

    download_datasets(username=args.username, key=args.key)
