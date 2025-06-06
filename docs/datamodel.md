# 🧩 SliceWise – Data Model

This MVP uses in-browser state (React) to simulate and visualize equity data. Here's the core schema used:

---

## 📦 Entities

### Founders / Team

```ts
{
  id: string
  name: string
  shares: number
}
```

### SAFE Investor

```ts
{
  id: string
  name: string
  amount: number
  valuationCap: number
}
```

### Funding Round

```ts
{
  roundName: string
  amount: number
  preMoney: number
}
```

### Cap Table (computed)

```ts
{
  name: string
  shares: number
  percent: number
}
```

### Claude Prompt + Copilot Context

```ts
{
  question: string
  capTable: CapTable[]
  scenario: string
}
```

---

## 🔁 Derived Data

- % ownership from shares
- SAFE dilution based on valuation cap
- Pie chart slices from final cap table

