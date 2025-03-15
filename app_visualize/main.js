/**
 * メインスクリプト
 * ファイルアップロードと可視化の初期化を処理する
 */

// グローバル変数
let csvData = null;
let hierarchyLoaded = true; // 直接読み込むので常にtrue
let mappingsLoaded = true;  // 直接読み込むので常にtrue
let dialStructure = hierarchyStructureData; // 直接JavaScriptオブジェクトを使用
let fieldMapping = mappingsData.fieldMapping;
let phaseMapping = mappingsData.phaseMapping;
let categoryMapping = mappingsData.categoryMapping;

// DataProcessorのインスタンスを作成
const dataProcessor = new DataProcessor();
dataProcessor.dialStructure = dialStructure;
dataProcessor.fieldMapping = fieldMapping;
dataProcessor.phaseMapping = phaseMapping;
dataProcessor.categoryMapping = categoryMapping;

// DOMが読み込まれたら実行
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded イベントが発火しました');
    console.log('階層構造データ:', hierarchyStructureData);
    console.log('マッピングデータ:', mappingsData);
    
    // 階層構造データの検証
    validateHierarchyData();
    
    console.log('すべての設定ファイルが読み込まれました');
    
    // ファイル入力のイベントリスナーを設定
    const fileInput = document.getElementById('csv-file');
    console.log('ファイル入力要素:', fileInput);
    fileInput.addEventListener('change', handleFileSelect);
    
    // 可視化ボタンのイベントリスナーを設定
    const visualizeBtn = document.getElementById('visualize-btn');
    console.log('可視化ボタン要素:', visualizeBtn);
    visualizeBtn.addEventListener('click', visualizeData);
    
    // デモボタンのイベントリスナーを設定
    const demoBtn = document.getElementById('demo-btn');
    console.log('デモボタン要素:', demoBtn);
    demoBtn.addEventListener('click', visualizeDemoData);
    
    // 可視化コンテナの確認
    const container = document.getElementById('visualization-container');
    console.log('可視化コンテナ要素:', container);
});

/**
 * 階層構造データを検証する
 */
function validateHierarchyData() {
    console.log('階層構造データの検証を開始します');
    
    if (!hierarchyStructureData) {
        console.error('階層構造データが読み込まれていません');
        return;
    }
    
    // 分野の数をチェック
    const fields = hierarchyStructureData.children || [];
    console.log(`分野の数: ${fields.length}`);
    
    // 各分野のフェーズとカテゴリをチェック
    fields.forEach(field => {
        const phases = field.children || [];
        console.log(`分野「${field.name}」のフェーズ数: ${phases.length}`);
        
        phases.forEach(phase => {
            const categories = phase.children || [];
            console.log(`分野「${field.name}」フェーズ「${phase.name}」のカテゴリ数: ${categories.length}`);
            console.log(`カテゴリ: ${categories.map(cat => cat.name).join(', ')}`);
        });
    });
    
    console.log('階層構造データの検証が完了しました');
}

/**
 * 設定ファイルが読み込まれているかチェック
 */
function checkConfigLoaded() {
    return hierarchyLoaded && mappingsLoaded;
}

/**
 * ファイル選択時の処理
 * @param {Event} event - ファイル選択イベント
 */
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log(`ファイルが選択されました: ${file.name}, サイズ: ${file.size} バイト`);
    
    // 設定ファイルが読み込まれているか確認
    if (!checkConfigLoaded()) {
        alert('設定ファイルの読み込みが完了していません。しばらくお待ちください。');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        csvData = e.target.result;
        console.log(`CSVデータを読み込みました: ${csvData.length} バイト`);
        console.log(`CSVデータの先頭部分: ${csvData.substring(0, 100)}...`);
        
        // 可視化ボタンを有効化
        const visualizeBtn = document.getElementById('visualize-btn');
        visualizeBtn.disabled = false;
        console.log('可視化ボタンを有効化しました');
    };
    reader.readAsText(file);
}

/**
 * データを可視化する
 */
function visualizeData() {
    console.log("visualizeData 関数が呼び出されました");
    
    // 設定ファイルが読み込まれているか確認
    if (!checkConfigLoaded()) {
        alert('設定ファイルの読み込みが完了していません。しばらくお待ちください。');
        return;
    }
    
    if (!csvData) {
        alert('CSVファイルを選択してください');
        return;
    }
    
    try {
        console.log("データの処理を開始します");
        console.log("CSVデータのサイズ:", csvData.length, "バイト");
        console.log("CSVデータの先頭部分:", csvData.substring(0, 200));
        
        // データプロセッサーに設定を適用
        console.log("データプロセッサーに設定を適用します");
        dataProcessor.dialStructure = dialStructure;
        dataProcessor.fieldMapping = fieldMapping;
        dataProcessor.phaseMapping = phaseMapping;
        dataProcessor.categoryMapping = categoryMapping;
        
        // CSVデータを解析
        console.log("CSVデータの解析を開始します");
        const parsedData = dataProcessor.parseCSV(csvData);
        console.log("CSVデータを解析しました:", parsedData.length, "件のデータ");
        console.log("解析されたデータの例:", parsedData.slice(0, 3));
        
        // データを変換
        console.log("データの変換を開始します");
        const transformedData = dataProcessor.transformData(parsedData);
        console.log("データを変換しました:", transformedData);
        console.log("変換されたデータの構造:", Object.keys(transformedData));
        console.log("appsByPathのキー数:", Object.keys(transformedData.appsByPath).length);
        
        // appsByPathのキーを詳細に確認
        const appsByPathKeys = Object.keys(transformedData.appsByPath);
        console.log("appsByPathのキー例:", appsByPathKeys.slice(0, 10));
        
        // 各カテゴリのアプリ数を確認
        let totalApps = 0;
        appsByPathKeys.forEach(key => {
            const apps = transformedData.appsByPath[key];
            totalApps += apps.length;
            console.log(`カテゴリ「${key}」のアプリ数: ${apps.length}`);
        });
        console.log(`合計アプリ数: ${totalApps}`);
        
        // 可視化コンテナを表示（先に表示状態にする）
        const container = document.getElementById('visualization-container');
        
        // コンテナのスタイルを明示的に設定
        container.style.display = 'flex';
        container.style.visibility = 'visible';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.margin = '20px auto';
        container.style.position = 'relative';
        container.style.backgroundColor = '#ffffff';
        container.style.border = '1px solid #ddd';
        container.style.borderRadius = '8px';
        container.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        container.style.padding = '10px';
        container.style.overflow = 'visible';
        container.style.minHeight = '80vh';
        
        // 既存のSVG要素を削除
        container.innerHTML = '';
        
        console.log("可視化コンテナを表示しました:", container);
        
        // 可視化を実行
        console.log("可視化を実行します");
        const visualization = new Visualization('visualization-container');
        visualization.render(transformedData);
        
    } catch (error) {
        console.error('可視化中にエラーが発生しました:', error);
        console.error(error.stack);
        alert('データの可視化中にエラーが発生しました');
    }
}

/**
 * デモデータを生成して可視化する
 */
function visualizeDemoData() {
    console.log("visualizeDemoData 関数が呼び出されました");
    
    // 設定ファイルが読み込まれているか確認
    if (!checkConfigLoaded()) {
        alert('設定ファイルの読み込みが完了していません。しばらくお待ちください。');
        return;
    }
    
    try {
        console.log("デモデータの生成を開始します");
        
        // デモデータを生成
        const demoData = generateDemoData();
        console.log("デモデータを生成しました:", demoData.length, "件のデータ");
        
        // データプロセッサーに設定を適用
        dataProcessor.dialStructure = dialStructure;
        dataProcessor.fieldMapping = fieldMapping;
        dataProcessor.phaseMapping = phaseMapping;
        dataProcessor.categoryMapping = categoryMapping;
        
        // データを変換
        const transformedData = dataProcessor.transformData(demoData);
        console.log("データを変換しました:", transformedData);
        
        // 可視化コンテナを表示（先に表示状態にする）
        const container = document.getElementById('visualization-container');
        
        // コンテナのスタイルを明示的に設定
        container.style.display = 'flex';
        container.style.visibility = 'visible';
        container.style.justifyContent = 'center';
        container.style.alignItems = 'center';
        container.style.margin = '20px auto';
        container.style.position = 'relative';
        container.style.backgroundColor = '#ffffff';
        container.style.border = '1px solid #ddd';
        container.style.borderRadius = '8px';
        container.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        container.style.padding = '10px';
        container.style.overflow = 'visible';
        container.style.minHeight = '80vh';
        
        // 既存のSVG要素を削除
        container.innerHTML = '';
        
        console.log("可視化コンテナを表示しました:", container);
        
        // 可視化を実行
        console.log("可視化を実行します");
        const visualization = new Visualization('visualization-container');
        visualization.render(transformedData);
        
    } catch (error) {
        console.error('デモデータの可視化中にエラーが発生しました:', error);
        console.error(error.stack);
        alert('デモデータの可視化中にエラーが発生しました');
    }
}

/**
 * デモデータを生成する
 * @returns {Array} デモデータの配列
 */
function generateDemoData() {
    const demoData = [];
    const fields = ["建築", "土木", "プラント", "ハウスメーカー"];
    const phases = ["設計", "施工・建設(プラント)", "維持管理・運営保全O＆M(プラント)"];
    const categories = {
        "設計": ["意匠", "構造", "設備", "設備(空調)"],
        "施工・建設(プラント)": ["施工総合管理", "工程管理", "原価管理", "品質管理", "安全管理", "見積"],
        "維持管理・運営保全O＆M(プラント)": ["建物管理", "作業管理"]
    };
    const subcategories = ["設計", "積算"];
    const companies = ["A社", "B社", "C社", "D社", "E社"];
    
    // アプリケーション名のプレフィックス
    const appPrefixes = {
        "意匠": ["BIM", "CAD", "3Dモデリング", "レンダリング"],
        "構造": ["構造解析", "耐震設計", "構造計算", "FEM解析"],
        "設備": ["設備CAD", "MEP設計", "空調設計", "電気設計"],
        "設備(空調)": ["空調シミュレーション", "熱負荷計算", "ダクト設計", "換気設計"],
        "施工総合管理": ["施工管理", "現場管理", "工事管理", "総合管理"],
        "工程管理": ["工程表", "スケジューラー", "進捗管理", "タスク管理"],
        "原価管理": ["原価計算", "コスト管理", "予算管理", "見積管理"],
        "品質管理": ["品質検査", "検査管理", "品質保証", "不具合管理"],
        "安全管理": ["安全点検", "リスク管理", "安全教育", "事故防止"],
        "見積": ["見積作成", "数量拾い", "単価管理", "見積比較"],
        "建物管理": ["施設管理", "保守管理", "設備点検", "修繕計画"],
        "作業管理": ["作業指示", "巡回管理", "清掃管理", "警備管理"]
    };
    
    // 各分野、フェーズ、カテゴリの組み合わせでアプリケーションを生成
    fields.forEach(field => {
        phases.forEach(phase => {
            const phaseCategories = categories[phase] || [];
            
            phaseCategories.forEach(category => {
                // アプリケーション数をランダムに決定（3〜8個）
                const appCount = Math.floor(Math.random() * 6) + 3;
                
                // 第四階層が必要なカテゴリかどうかを確認
                const needsFourthLevel = (category === "意匠" || category === "構造" || category === "設備") && phase === "設計";
                
                if (needsFourthLevel) {
                    // 第四階層のサブカテゴリごとにアプリケーションを生成
                    subcategories.forEach(subcategory => {
                        for (let i = 0; i < appCount; i++) {
                            const prefixes = appPrefixes[category] || ["アプリ"];
                            const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
                            const appName = `${prefix}${String.fromCharCode(65 + i)}`;
                            const company = companies[Math.floor(Math.random() * companies.length)];
                            const sales = `¥${(Math.random() * 10 + 1).toFixed(1)}億`;
                            
                            demoData.push({
                                field: field,
                                phase: phase,
                                category: category,
                                subcategory: subcategory,
                                name: appName,
                                company: company,
                                sales: sales
                            });
                        }
                    });
                } else {
                    // 通常の第三階層までのカテゴリ
                    for (let i = 0; i < appCount; i++) {
                        const prefixes = appPrefixes[category] || ["アプリ"];
                        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
                        const appName = `${prefix}${String.fromCharCode(65 + i)}`;
                        const company = companies[Math.floor(Math.random() * companies.length)];
                        const sales = `¥${(Math.random() * 10 + 1).toFixed(1)}億`;
                        
                        demoData.push({
                            field: field,
                            phase: phase,
                            category: category,
                            name: appName,
                            company: company,
                            sales: sales
                        });
                    }
                }
            });
        });
    });
    
    return demoData;
} 