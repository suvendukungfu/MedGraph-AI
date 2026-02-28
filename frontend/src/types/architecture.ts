export interface BlueprintBlock {
  title: string
  items: string[]
}

export interface BlueprintTable {
  title: string
  columns: string[]
  rows: string[][]
}

export interface BlueprintCodeBlock {
  title: string
  language: string
  content: string
}

export interface BlueprintSection {
  id: number
  title: string
  summary: string
  blocks: BlueprintBlock[]
  tables?: BlueprintTable[]
  codeBlocks?: BlueprintCodeBlock[]
}
