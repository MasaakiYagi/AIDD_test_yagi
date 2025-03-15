/**
 * データ処理モジュール
 * CSVデータを解析し、可視化に適した形式に変換する
 */
class DataProcessor {
    constructor() {
        // 初期化時は空のデータ構造を持つ
        this.dialStructure = null;
        this.fieldMapping = {};
        this.phaseMapping = {};
        this.categoryMapping = {};
        this.subcategoryMapping = {};
        
        // CSVヘッダーと内部フィールド名のマッピング
        this.headerMapping = {
            // 製品情報
            "製品名": "name",
            "ソフト名": "name",
            "アプリ名": "name",
            "名称": "name",
            "ソフトウェア名": "name",
            "アプリケーション名": "name",
            "product name": "name",
            "name": "name",
            
            // 製品概要
            "ソフト概要": "description",
            "製品概要": "description",
            "概要": "description",
            "説明": "description",
            "description": "description",
            "summary": "description",
            
            // 開発企業
            "開発企業": "company",
            "企業名": "company",
            "会社名": "company",
            "開発会社": "company",
            "ベンダー": "company",
            "メーカー": "company",
            "developer": "company",
            "company": "company",
            
            // 製品URL
            "製品URL": "url",
            "URL": "url",
            "ウェブサイト": "url",
            "サイト": "url",
            "website": "url",
            "product url": "url",
            
            // 売上情報
            "売上": "sales",
            "売上高": "sales",
            "年間売上": "sales",
            "売上額": "sales",
            "revenue": "sales",
            "sales": "sales",
            
            // 分野
            "分野": "field",
            "field": "field",
            
            // フェーズ
            "フェーズ": "phase",
            "phase": "phase",
            
            // カテゴリ
            "カテゴリ": "category",
            "category": "category",
            
            // サブカテゴリ
            "サブカテゴリ": "subcategory",
            "subcategory": "subcategory"
        };
        
        // デフォルト値を設定
        this.setDefaultValues();
    }
    
    /**
     * デフォルト値を設定する
     */
    setDefaultValues() {
        // 階層構造のデフォルト値
        this.dialStructure = {
            name: "建設60兆",
            type: "center",
            children: []
        };
        
        // 分野のマッピング
        this.fieldMapping = {
            "建築": "建築",
            "土木": "土木",
            "プラント": "プラント",
            "ハウスメーカー": "建築", // ハウスメーカーは建築に分類
            "設備": "建築", // 設備は建築に分類
            "": "その他" // 空の場合はその他に分類
        };
        
        // フェーズのマッピング
        this.phaseMapping = {
            "設計": "設計",
            "施工": "施工",
            "施工・建設(プラント)": "施工",
            "施工・建設": "施工",
            "営業": "施工",
            "維持管理": "維持管理",
            "維持管理・運営保全O＆M(プラント)": "維持管理",
            "維持管理・運営保全O＆M": "維持管理",
            "": "その他" // 空の場合はその他に分類
        };
        
        // カテゴリのマッピング
        this.categoryMapping = {
            // 設計フェーズのカテゴリ
            "意匠": "意匠",
            "構造": "構造",
            "設備": "設備",
            "設備(空調)": "設備",
            "積算": "積算",
            "企画": "意匠",
            
            // 施工フェーズのカテゴリ
            "施工総合管理": "施工総合管理",
            "工程管理": "工程管理",
            "原価管理": "原価管理",
            "品質管理": "品質管理",
            "安全管理": "安全管理",
            "見積": "原価管理", // 見積は原価管理に分類
            
            // 維持管理フェーズのカテゴリ
            "建物管理": "保全",
            "作業管理": "運用",
            "保全": "保全",
            "運用": "運用",
            "改修": "改修",
            
            // プラント特有のカテゴリ
            "土木": "土木",
            "配管": "配管",
            "プロセス": "プロセス",
            
            "": "その他" // 空の場合はその他に分類
        };
        
        // サブカテゴリのマッピング
        this.subcategoryMapping = {
            "設計": "設計",
            "積算": "積算",
            "": "設計" // デフォルトは設計
        };
    }

    /**
     * CSVデータを解析する
     * @param {string} csvText - CSVテキストデータ
     * @returns {Array} 解析されたデータの配列
     */
    parseCSV(csvText) {
        console.log("parseCSV: CSVデータの解析を開始します");
        
        // CSVを行に分割（改行コードの違いを考慮）
        const lines = csvText.split(/\r?\n/);
        console.log(`CSVデータの行数: ${lines.length}`);
        
        // ヘッダー行を取得
        const headers = this.parseCSVLine(lines[0]);
        console.log("CSVヘッダー:", headers);
        
        // ヘッダーマッピングの検証と自動マッピング
        const headerMappingResult = this.validateAndMapHeaders(headers);
        console.log("ヘッダーマッピング結果:", headerMappingResult);
        
        // 各行をオブジェクトに変換
        const data = [];
        let validRows = 0;
        let invalidRows = 0;
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '') {
                continue;
            }
            
            try {
                const values = this.parseCSVLine(lines[i]);
                
                // ヘッダーと値の数が一致しない場合は警告
                if (values.length !== headers.length) {
                    console.warn(`行 ${i+1}: ヘッダー数(${headers.length})と値の数(${values.length})が一致しません`);
                    console.warn("行の内容:", lines[i]);
                    invalidRows++;
                    continue;
                }
                
                const row = {};
                
                // ヘッダーマッピングを適用してデータを変換
                headers.forEach((header, index) => {
                    const internalField = headerMappingResult.mapping[header] || header;
                    row[internalField] = values[index] || '';
                });
                
                // 製品名の処理
                if (row.name) {
                    // URLパターンを検出
                    const urlPattern = /https?:\/\/[^\s]+/;
                    if (urlPattern.test(row.name)) {
                        console.warn(`行 ${i+1}: 製品名にURLが含まれています。URLを削除します。`);
                        // URLを削除
                        row.name = row.name.replace(urlPattern, '').trim();
                    }
                    
                    // 括弧内の情報を削除（例: "製品名 (URL)" → "製品名"）
                    if (row.name.includes('(') && row.name.includes(')')) {
                        row.name = row.name.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
                    }
                    
                    // 製品名が長すぎる場合は、概要である可能性が高いので切り詰める
                    if (row.name.length > 50) {
                        console.warn(`行 ${i+1}: 製品名が長すぎます（${row.name.length}文字）。切り詰めます。`);
                        // 最初の50文字を取得し、最後の単語が途切れないようにする
                        const truncated = row.name.substring(0, 50).replace(/\s+\S*$/, '');
                        // 元の製品名を概要として保存
                        if (!row.description) {
                            row.description = row.name;
                        }
                        row.name = truncated + '...';
                    }
                }
                
                // 必須フィールドの確認と補完
                if (!row.field) {
                    // ①分野がない場合は②分野を使用
                    row.field = row.field2 || '';
                }
                
                if (!row.phase) {
                    // ①フェーズがない場合は②フェーズを使用
                    row.phase = row.phase2 || '';
                }
                
                if (!row.category) {
                    // ①細目・管理項目がない場合は②細目・管理項目を使用
                    row.category = row.category2 || '';
                }
                
                // 必須フィールドが揃っているか確認
                if (!row.name) {
                    console.warn(`行 ${i+1}: 製品名が不足しています`, row);
                    invalidRows++;
                    continue;
                }
                
                // 分野、フェーズ、カテゴリのいずれかが不足している場合は補完を試みる
                if (!row.field || !row.phase || !row.category) {
                    console.warn(`行 ${i+1}: 分野/フェーズ/カテゴリのいずれかが不足しています。補完を試みます。`, row);
                    
                    // 製品名や概要から分野/フェーズ/カテゴリを推測
                    if (!row.field) row.field = this.inferField(row);
                    if (!row.phase) row.phase = this.inferPhase(row);
                    if (!row.category) row.category = this.inferCategory(row);
                    
                    // 補完後も不足している場合はスキップ
                    if (!row.field || !row.phase || !row.category) {
                        console.warn(`行 ${i+1}: 補完後も分野/フェーズ/カテゴリが不足しています。スキップします。`, row);
                        invalidRows++;
                        continue;
                    }
                }
                
                data.push(row);
                validRows++;
            } catch (error) {
                console.error(`行 ${i+1} の解析中にエラーが発生しました:`, error);
                console.error("行の内容:", lines[i]);
                invalidRows++;
            }
        }
        
        console.log(`CSVデータの解析完了: 有効な行数=${validRows}, 無効な行数=${invalidRows}, 合計=${data.length}件のデータ`);
        
        return data;
    }
    
    /**
     * ヘッダーを検証し、内部フィールド名にマッピングする
     * @param {Array} headers - CSVヘッダーの配列
     * @returns {Object} マッピング結果
     */
    validateAndMapHeaders(headers) {
        const result = {
            mapping: {},
            missingRequiredFields: [],
            unmappedHeaders: []
        };
        
        // 必須フィールドのリスト
        const requiredFields = ['name', 'field', 'phase', 'category'];
        const mappedInternalFields = new Set();
        
        // 各ヘッダーに対してマッピングを適用
        headers.forEach(header => {
            const internalField = this.headerMapping[header];
            
            if (internalField) {
                result.mapping[header] = internalField;
                mappedInternalFields.add(internalField);
            } else {
                // 類似のヘッダー名を探す
                const similarHeader = this.findSimilarHeader(header);
                if (similarHeader) {
                    const similarInternalField = this.headerMapping[similarHeader];
                    result.mapping[header] = similarInternalField;
                    mappedInternalFields.add(similarInternalField);
                    console.log(`ヘッダー「${header}」を「${similarHeader}」(${similarInternalField})に自動マッピングしました`);
                } else {
                    result.mapping[header] = header; // マッピングがない場合はそのまま使用
                    result.unmappedHeaders.push(header);
                    console.warn(`ヘッダー「${header}」に対応するマッピングが見つかりませんでした`);
                }
            }
        });
        
        // 必須フィールドが不足しているかチェック
        requiredFields.forEach(field => {
            if (!mappedInternalFields.has(field)) {
                result.missingRequiredFields.push(field);
                console.warn(`必須フィールド「${field}」に対応するヘッダーがありません`);
            }
        });
        
        return result;
    }
    
    /**
     * 類似のヘッダー名を探す
     * @param {string} header - 検索するヘッダー名
     * @returns {string|null} 類似のヘッダー名、または見つからない場合はnull
     */
    findSimilarHeader(header) {
        // ヘッダー名を小文字に変換して比較
        const lowerHeader = header.toLowerCase();
        
        // 製品名に関連する可能性のあるキーワード
        if (lowerHeader.includes('製品') || lowerHeader.includes('ソフト') || 
            lowerHeader.includes('アプリ') || lowerHeader.includes('名称') || 
            lowerHeader.includes('name') || lowerHeader.includes('product')) {
            return "製品名";
        }
        
        // 企業名に関連する可能性のあるキーワード
        if (lowerHeader.includes('企業') || lowerHeader.includes('会社') || 
            lowerHeader.includes('ベンダー') || lowerHeader.includes('メーカー') || 
            lowerHeader.includes('company') || lowerHeader.includes('developer')) {
            return "開発企業";
        }
        
        // 売上に関連する可能性のあるキーワード
        if (lowerHeader.includes('売上') || lowerHeader.includes('年商') || 
            lowerHeader.includes('revenue') || lowerHeader.includes('sales')) {
            return "売上";
        }
        
        // 分野に関連する可能性のあるキーワード
        if (lowerHeader.includes('分野') || lowerHeader.includes('field') || 
            lowerHeader.includes('category') && !lowerHeader.includes('sub')) {
            // 第二分野かどうかを判断
            if (lowerHeader.includes('2') || lowerHeader.includes('②') || 
                lowerHeader.includes('second') || lowerHeader.includes('副')) {
                return "②分野";
            }
            return "①分野";
        }
        
        // フェーズに関連する可能性のあるキーワード
        if (lowerHeader.includes('フェーズ') || lowerHeader.includes('phase') || 
            lowerHeader.includes('stage')) {
            // 第二フェーズかどうかを判断
            if (lowerHeader.includes('2') || lowerHeader.includes('②') || 
                lowerHeader.includes('second') || lowerHeader.includes('副')) {
                return "②フェーズ";
            }
            return "①フェーズ";
        }
        
        // カテゴリに関連する可能性のあるキーワード
        if (lowerHeader.includes('細目') || lowerHeader.includes('管理項目') || 
            lowerHeader.includes('カテゴリ') || lowerHeader.includes('subcategory')) {
            // 第二カテゴリかどうかを判断
            if (lowerHeader.includes('2') || lowerHeader.includes('②') || 
                lowerHeader.includes('second') || lowerHeader.includes('副')) {
                return "②細目・管理項目";
            }
            return "①細目・管理項目";
        }
        
        // 機能に関連する可能性のあるキーワード
        if (lowerHeader.includes('機能') || lowerHeader.includes('function') || 
            lowerHeader.includes('feature')) {
            // 第二機能かどうかを判断
            if (lowerHeader.includes('2') || lowerHeader.includes('②') || 
                lowerHeader.includes('second') || lowerHeader.includes('副')) {
                return "②機能";
            }
            return "①機能";
        }
        
        return null; // 類似のヘッダーが見つからない場合
    }
    
    /**
     * 製品名や概要から分野を推測する
     * @param {Object} row - データ行
     * @returns {string} 推測された分野
     */
    inferField(row) {
        // 製品名と概要を組み合わせて推測
        const nameAndDesc = ((row.name || '') + ' ' + (row.description || '')).toLowerCase();
        
        if (nameAndDesc.includes('建築') || nameAndDesc.includes('ハウス')) {
            return '建築';
        } else if (nameAndDesc.includes('土木') || nameAndDesc.includes('橋梁') || nameAndDesc.includes('道路')) {
            return '土木';
        } else if (nameAndDesc.includes('プラント') || nameAndDesc.includes('工場')) {
            return 'プラント';
        }
        
        return '建築'; // デフォルトは建築
    }
    
    /**
     * 製品名や概要からフェーズを推測する
     * @param {Object} row - データ行
     * @returns {string} 推測されたフェーズ
     */
    inferPhase(row) {
        // 製品名と概要を組み合わせて推測
        const nameAndDesc = ((row.name || '') + ' ' + (row.description || '')).toLowerCase();
        
        if (nameAndDesc.includes('設計') || nameAndDesc.includes('cad') || nameAndDesc.includes('bim')) {
            return '設計';
        } else if (nameAndDesc.includes('施工') || nameAndDesc.includes('工事') || nameAndDesc.includes('現場')) {
            return '施工・建設(プラント)';
        } else if (nameAndDesc.includes('維持') || nameAndDesc.includes('管理') || nameAndDesc.includes('保全')) {
            return '維持管理・運営保全O＆M(プラント)';
        }
        
        return '施工・建設(プラント)'; // デフォルトは施工
    }
    
    /**
     * 製品名や概要からカテゴリを推測する
     * @param {Object} row - データ行
     * @returns {string} 推測されたカテゴリ
     */
    inferCategory(row) {
        // 製品名と概要を組み合わせて推測
        const nameAndDesc = ((row.name || '') + ' ' + (row.description || '')).toLowerCase();
        
        // 設計関連
        if (nameAndDesc.includes('意匠') || nameAndDesc.includes('デザイン')) {
            return '意匠';
        } else if (nameAndDesc.includes('構造') || nameAndDesc.includes('耐震')) {
            return '構造';
        } else if (nameAndDesc.includes('設備') || nameAndDesc.includes('空調') || nameAndDesc.includes('電気')) {
            return '設備';
        } else if (nameAndDesc.includes('積算') || nameAndDesc.includes('見積')) {
            return '積算';
        }
        
        // 施工関連
        else if (nameAndDesc.includes('工程') || nameAndDesc.includes('スケジュール')) {
            return '工程管理';
        } else if (nameAndDesc.includes('原価') || nameAndDesc.includes('コスト')) {
            return '原価管理';
        } else if (nameAndDesc.includes('品質') || nameAndDesc.includes('検査')) {
            return '品質管理';
        } else if (nameAndDesc.includes('安全') || nameAndDesc.includes('事故')) {
            return '安全管理';
        }
        
        // 維持管理関連
        else if (nameAndDesc.includes('保全') || nameAndDesc.includes('点検')) {
            return '保全';
        } else if (nameAndDesc.includes('運用') || nameAndDesc.includes('オペレーション')) {
            return '運用';
        } else if (nameAndDesc.includes('改修') || nameAndDesc.includes('リノベーション')) {
            return '改修';
        }
        
        return '施工総合管理'; // デフォルトは施工総合管理
    }
    
    /**
     * CSV行を解析する（カンマ区切りだが、引用符内のカンマは考慮）
     * @param {string} line - CSV行
     * @returns {Array} 解析された値の配列
     */
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }
    
    /**
     * 売上額を数値に変換する
     * @param {string} salesStr - 売上額の文字列
     * @returns {number} 変換された数値
     */
    parseSalesAmount(salesStr) {
        if (!salesStr) return 0;
        
        try {
            // カンマと円記号を削除
            let cleaned = salesStr.replace(/[¥,]/g, '');
            
            // 括弧内の情報を削除（例: "99,000(永久ライセンス)" → "99000"）
            cleaned = cleaned.replace(/\(.*\)/g, '');
            
            // 数値部分を抽出
            const match = cleaned.match(/(\d+(?:\.\d+)?)/);
            if (!match) return 0;
            
            let value = parseFloat(match[1]);
            
            // 単位に基づいて変換
            if (cleaned.includes('兆')) {
                value *= 1000000000000; // 兆円を円に変換
            } else if (cleaned.includes('億')) {
                value *= 100000000; // 億円を円に変換
            } else if (cleaned.includes('万')) {
                value *= 10000; // 万円を円に変換
            }
            
            return value;
        } catch (error) {
            console.error(`売上額の解析中にエラーが発生しました: ${salesStr}`, error);
            return 0;
        }
    }
    
    /**
     * データを変換する
     * @param {Array} data - 解析されたCSVデータ
     * @returns {Object} 変換されたデータ
     */
    transformData(data) {
        console.log("transformData: データの変換を開始します");
        console.log(`変換対象データ: ${data.length}件`);
        
        // 分野、フェーズ、カテゴリごとにアプリケーションを集計
        const categories = {};
        
        // 各アプリケーションを処理
        let processedCount = 0;
        let skippedCount = 0;
        let mappingErrors = 0;
        
        // 分野、フェーズ、カテゴリの出現回数を記録
        const fieldCounts = {};
        const phaseCounts = {};
        const categoryCounts = {};
        
        data.forEach((app, index) => {
            try {
                // 元の値を記録（デバッグ用）
                const originalField = app.field;
                const originalPhase = app.phase;
                const originalCategory = app.category;
                
                // マッピングを適用
                const field = this.fieldMapping[app.field] || app.field;
                const phase = this.phaseMapping[app.phase] || app.phase;
                const category = this.categoryMapping[app.category] || app.category;
                
                // 出現回数をカウント
                fieldCounts[originalField] = (fieldCounts[originalField] || 0) + 1;
                phaseCounts[originalPhase] = (phaseCounts[originalPhase] || 0) + 1;
                categoryCounts[originalCategory] = (categoryCounts[originalCategory] || 0) + 1;
                
                // マッピングエラーのチェック
                if (field !== app.field && !this.fieldMapping[app.field]) {
                    console.warn(`アプリ ${index+1}: 分野「${app.field}」のマッピングがありません`);
                    mappingErrors++;
                }
                if (phase !== app.phase && !this.phaseMapping[app.phase]) {
                    console.warn(`アプリ ${index+1}: フェーズ「${app.phase}」のマッピングがありません`);
                    mappingErrors++;
                }
                if (category !== app.category && !this.categoryMapping[app.category]) {
                    console.warn(`アプリ ${index+1}: カテゴリ「${app.category}」のマッピングがありません`);
                    mappingErrors++;
                }
                
                // 階層構造データに存在するかチェック
                if (!this.isValidHierarchy(field, phase, category)) {
                    console.warn(`アプリ ${index+1}: 階層構造に存在しない組み合わせです: ${field}/${phase}/${category}`);
                    console.warn(`  元の値: ${originalField}/${originalPhase}/${originalCategory}`);
                    
                    // 最も近い有効な組み合わせを探す
                    const validCombination = this.findValidCombination(field, phase, category);
                    if (validCombination) {
                        console.log(`  修正: ${validCombination.field}/${validCombination.phase}/${validCombination.category}`);
                        // 修正した値を使用
                        const { field: newField, phase: newPhase, category: newCategory } = validCombination;
                        
                        // 売上額を解析
                        const sales = this.parseSalesAmount(app.sales);
                        
                        // 第四階層が必要なカテゴリかどうかを確認
                        const needsFourthLevel = (newCategory === "意匠" || newCategory === "構造" || newCategory === "設備") && newPhase === "設計";
                        
                        let key;
                        if (needsFourthLevel) {
                            // 第四階層のサブカテゴリ（設計または積算）
                            const subcategory = this.subcategoryMapping[app.subcategory] || "設計"; // デフォルトは設計
                            
                            // キーを生成（分野/フェーズ/カテゴリ/サブカテゴリ）
                            key = `${newField}/${newPhase}/${newCategory}/${subcategory}`;
                        } else {
                            // 通常の第三階層までのカテゴリ
                            // キーを生成（分野/フェーズ/カテゴリ）
                            key = `${newField}/${newPhase}/${newCategory}`;
                        }
                        
                        if (!categories[key]) {
                            categories[key] = [];
                        }
                        
                        // 製品名からURLを分離
                        let cleanName = app.name || '';
                        cleanName = cleanName.replace(/\s*\(https?:\/\/[^\)]+\)\s*/g, '');
                        cleanName = cleanName.replace(/https?:\/\/\S+/g, '').trim();
                        
                        categories[key].push({
                            name: cleanName,
                            description: app.description || '',
                            sales: sales,
                            company: app.company || '',
                            url: app.url || ''
                        });
                        
                        processedCount++;
                    } else {
                        console.warn(`  有効な組み合わせが見つかりませんでした。スキップします。`);
                        skippedCount++;
                    }
                } else {
                    // 売上額を解析
                    const sales = this.parseSalesAmount(app.sales);
                    
                    // 第四階層が必要なカテゴリかどうかを確認
                    const needsFourthLevel = (category === "意匠" || category === "構造" || category === "設備") && phase === "設計";
                    
                    let key;
                    if (needsFourthLevel) {
                        // 第四階層のサブカテゴリ（設計または積算）
                        const subcategory = this.subcategoryMapping[app.subcategory] || "設計"; // デフォルトは設計
                        
                        // キーを生成（分野/フェーズ/カテゴリ/サブカテゴリ）
                        key = `${field}/${phase}/${category}/${subcategory}`;
                    } else {
                        // 通常の第三階層までのカテゴリ
                        // キーを生成（分野/フェーズ/カテゴリ）
                        key = `${field}/${phase}/${category}`;
                    }
                    
                    if (!categories[key]) {
                        categories[key] = [];
                    }
                    
                    // 製品名からURLを分離
                    let cleanName = app.name || '';
                    cleanName = cleanName.replace(/\s*\(https?:\/\/[^\)]+\)\s*/g, '');
                    cleanName = cleanName.replace(/https?:\/\/\S+/g, '').trim();
                    
                    categories[key].push({
                        name: cleanName,
                        description: app.description || '',
                        sales: sales,
                        company: app.company || '',
                        url: app.url || ''
                    });
                    
                    processedCount++;
                }
            } catch (error) {
                console.error(`アプリ ${index+1} の処理中にエラーが発生しました:`, error);
                skippedCount++;
            }
        });
        
        // 各カテゴリ内でアプリケーションを売上順にソート
        Object.keys(categories).forEach(key => {
            categories[key].sort((a, b) => b.sales - a.sales);
        });
        
        console.log(`データ変換完了: 処理済み=${processedCount}, スキップ=${skippedCount}, マッピングエラー=${mappingErrors}`);
        
        return {
            structure: this.dialStructure,
            appsByPath: categories
        };
    }
    
    /**
     * 指定された分野/フェーズ/カテゴリの組み合わせが階層構造に存在するかチェックする
     * @param {string} field - 分野
     * @param {string} phase - フェーズ
     * @param {string} category - カテゴリ
     * @returns {boolean} 有効な組み合わせの場合はtrue
     */
    isValidHierarchy(field, phase, category) {
        // 階層構造データが存在しない場合は常にtrue
        if (!this.dialStructure || !this.dialStructure.children) {
            return true;
        }
        
        // 分野を検索
        const fieldNode = this.dialStructure.children.find(node => node.name === field);
        if (!fieldNode || !fieldNode.children) {
            return false;
        }
        
        // フェーズを検索
        const phaseNode = fieldNode.children.find(node => node.name === phase);
        if (!phaseNode || !phaseNode.children) {
            return false;
        }
        
        // カテゴリを検索
        const categoryNode = phaseNode.children.find(node => node.name === category);
        return !!categoryNode;
    }
    
    /**
     * 最も近い有効な階層構造の組み合わせを探す
     * @param {string} field - 分野
     * @param {string} phase - フェーズ
     * @param {string} category - カテゴリ
     * @returns {Object|null} 有効な組み合わせ、または見つからない場合はnull
     */
    findValidCombination(field, phase, category) {
        // 階層構造データが存在しない場合はnull
        if (!this.dialStructure || !this.dialStructure.children) {
            return null;
        }
        
        // 分野を検索
        let fieldNode = this.dialStructure.children.find(node => node.name === field);
        
        // 分野が見つからない場合は最初の分野を使用
        if (!fieldNode || !fieldNode.children) {
            fieldNode = this.dialStructure.children[0];
        }
        
        // フェーズを検索
        let phaseNode = fieldNode.children.find(node => node.name === phase);
        
        // フェーズが見つからない場合は最初のフェーズを使用
        if (!phaseNode || !phaseNode.children) {
            phaseNode = fieldNode.children[0];
        }
        
        // カテゴリを検索
        let categoryNode = phaseNode.children.find(node => node.name === category);
        
        // カテゴリが見つからない場合は最も近いカテゴリを探す
        if (!categoryNode) {
            // カテゴリ名の一部が一致するものを探す
            categoryNode = phaseNode.children.find(node => 
                category.includes(node.name) || node.name.includes(category)
            );
            
            // それでも見つからない場合は最初のカテゴリを使用
            if (!categoryNode) {
                categoryNode = phaseNode.children[0];
            }
        }
        
        return {
            field: fieldNode.name,
            phase: phaseNode.name,
            category: categoryNode.name
        };
    }
} 