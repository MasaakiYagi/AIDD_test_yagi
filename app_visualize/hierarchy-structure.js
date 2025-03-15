/**
 * 階層構造データ
 * 建設業界アプリケーションの階層構造を定義
 */
const hierarchyStructureData = {
  "name": "建設",
  "type": "center",
  "children": [
    {
      "name": "建築",
      "type": "field",
      "children": [
        {
          "name": "設計",
          "type": "phase",
          "children": [
            { "name": "意匠", "type": "category" },
            { "name": "構造", "type": "category" },
            { "name": "設備", "type": "category" },
            { "name": "積算", "type": "category" }
          ]
        },
        {
          "name": "施工",
          "type": "phase",
          "children": [
            { "name": "施工総合管理", "type": "category" },
            { "name": "工程管理", "type": "category" },
            { "name": "原価管理", "type": "category" },
            { "name": "品質管理", "type": "category" },
            { "name": "安全管理", "type": "category" }
          ]
        },
        {
          "name": "維持管理",
          "type": "phase",
          "children": [
            { "name": "保全", "type": "category" },
            { "name": "運用", "type": "category" },
            { "name": "改修", "type": "category" }
          ]
        }
      ]
    },
    {
      "name": "土木",
      "type": "field",
      "children": [
        {
          "name": "設計",
          "type": "phase",
          "children": [
            { "name": "設備", "type": "category" },
            { "name": "構造", "type": "category" },
            { "name": "積算", "type": "category" }
          ]
        },
        {
          "name": "施工",
          "type": "phase",
          "children": [
            { "name": "施工総合管理", "type": "category" },
            { "name": "工程管理", "type": "category" },
            { "name": "原価管理", "type": "category" },
            { "name": "品質管理", "type": "category" },
            { "name": "安全管理", "type": "category" }
          ]
        },
        {
          "name": "維持管理",
          "type": "phase",
          "children": [
            { "name": "保全", "type": "category" },
            { "name": "運用", "type": "category" },
            { "name": "改修", "type": "category" }
          ]
        }
      ]
    },
    {
      "name": "プラント",
      "type": "field",
      "children": [
        {
          "name": "設計",
          "type": "phase",
          "children": [
            { "name": "土木", "type": "category" },
            { "name": "配管", "type": "category" },
            { "name": "プロセス", "type": "category" },
            { "name": "積算", "type": "category" }
          ]
        },
        {
          "name": "施工",
          "type": "phase",
          "children": [
            { "name": "施工総合管理", "type": "category" },
            { "name": "工程管理", "type": "category" },
            { "name": "原価管理", "type": "category" },
            { "name": "品質管理", "type": "category" },
            { "name": "安全管理", "type": "category" }
          ]
        },
        {
          "name": "維持管理",
          "type": "phase",
          "children": [
            { "name": "保全", "type": "category" },
            { "name": "運用", "type": "category" },
            { "name": "改修", "type": "category" }
          ]
        }
      ]
    }
  ]
}; 