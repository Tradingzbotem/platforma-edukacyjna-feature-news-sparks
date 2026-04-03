# Founders NFT (Polygon) — minimal Hardhat + TypeScript

Prosty kontrakt **ERC-721** z limitem podaży, mintem tylko dla właściciela, `baseURI`, pauzą mintu i rozszerzeniem **Enumerable** (OpenZeppelin).

## Instalacja

W katalogu projektu:

```bash
npm install
```

## Konfiguracja `.env`

Skopiuj przykład i uzupełnij wartości:

```bash
copy .env.example .env
```

Na Linux/macOS:

```bash
cp .env.example .env
```

Wymagane zmienne (deploy na Amoy):

| Zmienna | Opis |
|--------|------|
| `PRIVATE_KEY` | Klucz prywatny portfela (0x…), który płaci gas |
| `RPC_URL` | Endpoint JSON-RPC **Polygon Amoy** |
| `NFT_NAME` | Nazwa kolekcji |
| `NFT_SYMBOL` | Symbol |
| `NFT_MAX_SUPPLY` | Maksymalna liczba NFT (liczba całkowita) |
| `NFT_BASE_URI` | Bazowy URI metadanych (zwykle kończy się na `/`) |
| `INITIAL_OWNER` | Adres `Ownable` (może być ten sam co deployer) |

Po deployu:

| Zmienna | Opis |
|--------|------|
| `NFT_CONTRACT_ADDRESS` | Adres wdrożonego kontraktu (dla `mint.ts`) |

Mint jednego NFT:

| Zmienna / argument | Opis |
|--------------------|------|
| `MINT_TO` **lub** pierwszy argument CLI | Adres odbiorcy NFT |

Na **Polygon mainnet** ustaw dodatkowo `POLYGON_RPC_URL` (skrypty przy `--network polygon` używają go zamiast `RPC_URL`, jeśli jest ustawiony).

Opcjonalnie: `POLYGONSCAN_API_KEY` — weryfikacja kontraktu na Polygonscan.

## Czym jest `baseURI`?

`baseURI` to prefiks URL-a, który OpenZeppelin dokleja do `tokenId` w `tokenURI(tokenId)`. Dla tokenu `7` i `baseURI = "https://cdn.example.com/founders/"` wynik to zwykle:

`https://cdn.example.com/founders/7`

Plik pod tym adresem powinien być JSON-em zgodnym ze standardem metadanych (np. `name`, `description`, `image`). Upewnij się, że hostujesz pliki `1.json`, `2.json`, … **lub** że serwer mapuje ścieżkę `/7` na JSON — zależnie od tego, czy w URI jest rozszerzenie `.json`.

## Przykład pliku metadanych (`1.json`)

```json
{
  "name": "Founder #1",
  "description": "Founders collection — token 1",
  "image": "ipfs://bafyExampleHash/1.png",
  "attributes": [
    { "trait_type": "Tier", "value": "Genesis" }
  ]
}
```

## Komendy

| Cel | Komenda |
|-----|---------|
| Instalacja zależności | `npm install` |
| Kompilacja | `npm run compile` |
| Deploy na Amoy | `npm run deploy:amoy` |
| Mint 1 NFT na Amoy (odbiorca z `.env` `MINT_TO`) | `npm run mint:amoy` |
| Mint z adresem w CLI | `npx hardhat run scripts/mint.ts --network polygonAmoy -- 0xRecipient...` |

Deploy / mint na mainnecie (po ustawieniu `POLYGON_RPC_URL` i właściwego `RPC_URL` lub samego `POLYGON_RPC_URL`):

```bash
npx hardhat run scripts/deploy.ts --network polygon
npx hardhat run scripts/mint.ts --network polygon
```

### Weryfikacja na explorerze (opcjonalnie)

Po deployu, z argumentami konstruktora w cudzysłowie:

```bash
npx hardhat verify --network polygonAmoy <ADRES> "<NFT_NAME>" "<SYMBOL>" <NFT_MAX_SUPPLY> "<NFT_BASE_URI>" <INITIAL_OWNER>
```

## Licencja

MIT (jak w nagłówku kontraktu).
