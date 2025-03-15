/**
 * 可視化モジュール
 * D3.jsを使用してダイヤル表示を生成する
 */
class Visualization {
    constructor(selector, width = 1000, height = 1000) {
        this.selector = selector;
        this.svg = null;
        this.width = width;
        this.height = height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.data = null;
        
        // 基本色の設定（階層ごとに自動的に色を計算するための基準色）
        this.baseColor = "#00796b"; // ベースとなる色
        
        // テキスト色の設定
        this.textColorLight = "#ffffff"; // 明るい背景用
        this.textColorDark = "#333333";  // 暗い背景用
        
        // 半径の設定
        this.baseRadius = 100;       // 中心円の半径
        this.radiusIncrement = 100;  // 各階層ごとの半径の増分
        this.maxLevels = 10;        // サポートする最大階層数
        
        // ポップアップの固定表示状態を追跡
        this.isPinned = false;
        this.pinnedNodePath = null;
        
        // ドラッグアンドドロップ用の変数
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        
        // レスポンシブ対応のためのリサイズイベントを設定
        window.addEventListener('resize', this.handleResize.bind(this));
    }
    
    /**
     * ウィンドウリサイズ時の処理
     */
    handleResize() {
        if (this.data) {
            this.updateVisualizationSize();
            this.render(this.data);
        }
    }
    
    /**
     * 可視化のサイズをウィンドウサイズに合わせて更新する
     */
    updateVisualizationSize() {
        // ウィンドウサイズを取得
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // コンテナ要素を取得
        const container = document.getElementById(this.selector);
        if (!container) return;
        
        // コンテナのパディングを取得
        const containerStyle = window.getComputedStyle(container);
        const paddingHorizontal = parseFloat(containerStyle.paddingLeft) + parseFloat(containerStyle.paddingRight);
        const paddingVertical = parseFloat(containerStyle.paddingTop) + parseFloat(containerStyle.paddingBottom);
        
        // 利用可能な最大サイズを計算（パディングを考慮）
        const availableWidth = windowWidth * 0.98 - paddingHorizontal;
        const availableHeight = windowHeight * 0.9 - paddingVertical;
        
        // 短い方の98%をサイズとして使用（最大限に表示）
        const size = Math.min(availableWidth, availableHeight);
        
        // サイズを更新
        this.width = size;
        this.height = size;
        
        // コンテナのサイズも更新
        if (container) {
            container.style.width = `${size + paddingHorizontal}px`;
            container.style.height = `${size + paddingVertical}px`;
        }
        
        console.log(`可視化サイズを更新: ${size}x${size}`);
    }
    
    /**
     * データを可視化する
     * @param {Object} data - 可視化するデータ
     */
    render(data) {
        console.log("render メソッドが呼び出されました", data);
        
        try {
            // データを保存
            this.data = data;
            
            // データの詳細をログ出力
            if (data && data.appsByPath) {
                // appsByPathからアプリケーションの総数を計算
                const allApps = [];
                Object.values(data.appsByPath).forEach(apps => {
                    allApps.push(...apps);
                });
                
                console.log(`CSVデータから読み込まれたアプリケーション数: ${allApps.length}`);
                console.log("アプリケーションの例:", allApps.slice(0, 3));
                
                // パスからフィールド、フェーズ、カテゴリを抽出
                const paths = Object.keys(data.appsByPath);
                const fields = new Set();
                const phases = new Set();
                const categories = new Set();
                
                paths.forEach(path => {
                    const parts = path.split('/');
                    if (parts.length >= 1) fields.add(parts[0]);
                    if (parts.length >= 2) phases.add(parts[1]);
                    if (parts.length >= 3) categories.add(parts[2]);
                });
                
                console.log("読み込まれた分野一覧:", [...fields]);
                console.log("読み込まれたフェーズ一覧:", [...phases]);
                console.log("読み込まれたカテゴリ一覧:", [...categories]);
                
                // アプリケーションデータを統合形式に変換
                this.apps = allApps.map(app => {
                    return {
                        ...app,
                        // 必要に応じて追加のプロパティを設定
                    };
                });
            } else {
                console.warn("CSVデータが正しく読み込まれていないか、アプリケーションデータがありません");
            }
            
            // 可視化を初期化
            const initialized = this.initialize();
            if (!initialized) {
                console.error("可視化の初期化に失敗しました");
                return;
            }
            
            console.log("可視化を初期化しました");
            
            // データ構造が存在するか確認
            if (!data || !data.structure) {
                console.error("データ構造が存在しません", data);
                return;
            }
            
            console.log("データ構造:", data.structure);
            
            // ダイアルを描画
            this.drawDial(data.structure, 0, 2 * Math.PI, 0);
            
            // イベントリスナーを設定
            this.setupEventListeners();
            
            console.log("可視化の描画が完了しました");
        } catch (error) {
            console.error("可視化の描画中にエラーが発生しました:", error);
            console.error(error.stack);
        }
    }
    
    /**
     * 可視化を初期化する
     */
    initialize() {
        console.log(`Visualization.initialize() called with selector: ${this.selector}`);
        
        // 可視化サイズをウィンドウサイズに合わせて更新
        this.updateVisualizationSize();
        
        // コンテナ要素を取得
        const container = document.getElementById(this.selector);
        console.log("Container element:", container);
        
        if (!container) {
            console.error(`Container element with ID '${this.selector}' not found`);
            return false;
        }
        
        // コンテナのスタイルを設定
        container.style.overflow = 'visible';
        container.style.width = `${this.width}px`;
        container.style.height = `${this.height}px`;
        container.style.margin = '0 auto';
        container.style.position = 'relative';
        
        // 既存のSVG要素を削除
        container.innerHTML = '';
        
        // SVG要素を作成
        this.svg = d3.select(`#${this.selector}`)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('viewBox', `-${this.width/2} -${this.height/2} ${this.width} ${this.height}`)
            .attr('preserveAspectRatio', 'xMidYMid meet')
            .style('display', 'block')
            .style('margin', '0 auto')
            .style('overflow', 'visible');
        
        console.log("SVG element created:", this.svg.node());
        
        // グループ要素を作成（中心が原点）
        this.svg = this.svg.append('g')
            .attr('class', 'dial-visualization-group');
        
        console.log("Group element created:", this.svg.node());
        
        // デバッグ用に中心点を表示（非表示に設定）
        this.svg.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 5)
            .attr('fill', 'red')
            .attr('class', 'center-debug-point')
            .style('opacity', 0); // 非表示に設定
        
        // 最大半径を計算（余白を最小限に）
        const maxRadius = Math.min(this.width, this.height) / 2 - 10;
        
        // 階層の深さを取得（データがある場合）
        let maxLevel = 4; // サンプル画像に合わせて4階層に設定（0:中心, 1:分野, 2:フェーズ, 3:カテゴリ）
        if (this.data && this.data.structure) {
            maxLevel = this.calculateMaxDepth(this.data.structure);
            console.log(`データの最大階層: ${maxLevel}`);
        }
        
        // 半径の配列を初期化
        this.radii = [];
        
        // 中心円の半径を設定（全体の20%）
        this.radii[0] = maxRadius * 0.2;
        
        // 第1階層の半径（全体の50%）
        this.radii[1] = maxRadius * 0.5;
        
        // 第2階層の半径（全体の75%）
        this.radii[2] = maxRadius * 0.75;
        
        // 第3階層の半径（全体の100%）
        this.radii[3] = maxRadius;
        
        console.log("Calculated radii:", this.radii);
        
        return true;
    }
    
    /**
     * データの最大階層を計算する
     * @param {Object} node - ノード
     * @param {number} currentLevel - 現在の階層
     * @returns {number} 最大階層
     */
    calculateMaxDepth(node, currentLevel = 0) {
        if (!node.children || node.children.length === 0) {
            return currentLevel;
        }
        
        let maxDepth = currentLevel;
        for (const child of node.children) {
            const childDepth = this.calculateMaxDepth(child, currentLevel + 1);
            maxDepth = Math.max(maxDepth, childDepth);
        }
        
        return maxDepth;
    }
    
    /**
     * 階層に基づいて色を計算する
     * @param {string} type - セグメントのタイプ
     * @param {number} level - 階層レベル
     * @returns {string} 計算された色
     */
    calculateColor(type, level) {
        // 中心は黒に近い色
        if (level === 0 || type === "center") {
            return "#0a1525"; // 濃い青黒色
        }
        
        // 第1階層は濃い青緑色
        if (level === 1) {
            return "#1f5758"; // 濃い青緑色
        }
        
        // 第2階層以降は明るい青緑色
        if (level === 2) {
            return "#358a8a"; // 明るい青緑色
        }
        
        if (level >= 3) {
            return "#4bbcbc"; // 明るい青緑色
        }

        return "#26c6da"; // デフォルトは明るい青緑色
    }
    
    /**
     * テキスト色を決定する
     * @param {string} backgroundColor - 背景色
     * @returns {string} テキスト色
     */
    getTextColor(backgroundColor) {
        // 背景色の明るさに基づいてテキスト色を決定
        const rgb = d3.rgb(backgroundColor);
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        
        return brightness > 125 ? this.textColorDark : this.textColorLight;
    }
    
    /**
     * ダイヤルを描画する
     * @param {Object} node - 描画するノード
     * @param {number} startAngle - 開始角度
     * @param {number} endAngle - 終了角度
     * @param {number} level - 階層レベル
     * @param {string} nodePath - ノードのパス
     */
    drawDial(node, startAngle, endAngle, level, nodePath = '') {
        console.log(`drawDial: level=${level}, node=${node.name}, type=${node.type}, startAngle=${startAngle}, endAngle=${endAngle}`);
        
        // 最初のレベルの場合は完全な円を描画
        if (level === 0) {
            startAngle = 0;
            endAngle = 2 * Math.PI;
            console.log("最初のレベル: 完全な円を描画します");
        }
        
        // 現在のノードのパスを構築
        const currentPath = nodePath ? `${nodePath}.${node.name}` : node.name;
        console.log(`Current path: ${currentPath}`);
        
        // 中心円を描画（レベル0の場合）
        if (level === 0) {
            this.drawCenter(node);
            console.log("中心円を描画しました");
        } 
        // セグメントを描画（レベル1以上の場合）
        else {
            console.log(`セグメントを描画します: level=${level}, node=${node.name}, type=${node.type}, radius=${this.radii[level]}`);
            this.drawSegment(node, startAngle, endAngle, level, currentPath);
            console.log(`セグメントを描画しました: ${node.name}`);
        }
        
        // 子ノードがある場合は再帰的に描画
        if (node.children && node.children.length > 0) {
            console.log(`${node.children.length}個の子ノードを描画します (level=${level}, parent=${node.name})`);
            
            // 子ノードごとの角度を計算
            const anglePerChild = (endAngle - startAngle) / node.children.length;
            console.log(`子ノードごとの角度: ${anglePerChild}`);
            
            // 各子ノードを描画
            node.children.forEach((child, index) => {
                const childStartAngle = startAngle + (index * anglePerChild);
                const childEndAngle = childStartAngle + anglePerChild;
                
                console.log(`子ノード ${index}: ${child.name}, type=${child.type}, 開始角度=${childStartAngle}, 終了角度=${childEndAngle}, 次のレベル=${level + 1}`);
                
                // 再帰的に子ノードを描画
                this.drawDial(child, childStartAngle, childEndAngle, level + 1, currentPath);
            });
        } else {
            console.log(`ノード ${node.name} には子ノードがありません (level=${level})`);
        }
    }
    
    /**
     * 中心円を描画する
     * @param {Object} node - 描画するノード
     */
    drawCenter(node) {
        console.log("drawCenter: 中心円を描画します", node);
        
        // 中心円の半径
        const radius = this.radii[0];
        console.log(`中心円の半径: ${radius}`);
        
        // 中心円の色
        const color = this.calculateColor(node.type, 0);
        console.log(`中心円の色: ${color}`);
        
        // 中心円を描画
        this.svg.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', radius)
            .attr('fill', color)
            .attr('stroke', 'white')
            .attr('stroke-width', 2)
            .attr('class', 'dial-center')
            .attr('data-node-name', node.name);
        
        // 中心テキストのサイズを半径に応じて調整
        const fontSize = Math.max(20, Math.min(32, radius / 2.5));
        
        // 中心テキストを自動的に分割
        const centerText = node.name;
        const lines = this.splitTextIntoLines(centerText, 2); // 最大2行に分割
        
        console.log(`中心テキストを分割: ${lines.join(' / ')}`);
        
        // 各行のテキストを描画
        lines.forEach((line, i) => {
            const lineOffset = (i - (lines.length - 1) / 2) * fontSize * 1.2;
            this.svg.append('text')
                .attr('x', 0)
                .attr('y', lineOffset)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .attr('fill', this.getTextColor(color))
                .attr('font-size', `${fontSize}px`)
                .attr('font-weight', 'bold')
                .attr('class', 'dial-center-text')
                .text(line);
        });
        
        console.log("中心円の描画が完了しました");
    }
    
    /**
     * テキストを適切な行数に分割する
     * @param {string} text - 分割するテキスト
     * @param {number} maxLines - 最大行数
     * @returns {Array} 分割されたテキストの配列
     */
    splitTextIntoLines(text, maxLines = 2) {
        // 数字と文字を分離する正規表現
        const numericMatch = text.match(/(\d+兆|\d+億|\d+万|\d+)/);
        
        if (numericMatch && maxLines >= 2) {
            // 数字部分と文字部分を分離
            const numericPart = numericMatch[0];
            const textPart = text.replace(numericPart, '').trim();
            
            if (textPart) {
                return [textPart, numericPart];
            }
        }
        
        // 数字がない場合や1行の場合は、文字数で均等に分割
        if (text.length <= 4 || maxLines <= 1) {
            return [text];
        }
        
        const lines = [];
        const charsPerLine = Math.ceil(text.length / maxLines);
        
        for (let i = 0; i < maxLines; i++) {
            const start = i * charsPerLine;
            const end = Math.min(start + charsPerLine, text.length);
            
            if (start < text.length) {
                lines.push(text.substring(start, end));
            }
        }
        
        return lines;
    }
    
    /**
     * セグメントを描画する
     * @param {Object} node - 描画するノード
     * @param {number} startAngle - 開始角度
     * @param {number} endAngle - 終了角度
     * @param {number} level - 階層レベル
     * @param {string} nodePath - ノードのパス
     */
    drawSegment(node, startAngle, endAngle, level, nodePath) {
        console.log(`drawSegment: level=${level}, node=${node.name}, type=${node.type}, startAngle=${startAngle}, endAngle=${endAngle}`);
        
        // 角度が小さすぎる場合は描画しない
        if (Math.abs(endAngle - startAngle) < 0.01) {
            console.log(`Skipping segment for ${node.name} - angle too small`);
            return;
        }
        
        // 半径の計算を修正
        // this.radii 配列のインデックスは0から始まるが、levelは1から始まるため調整が必要
        const innerRadius = this.radii[level - 1] || 0;
        
        // 外側の半径を取得（配列の範囲外の場合は最大半径を使用）
        let outerRadius;
        if (level < this.radii.length) {
            outerRadius = this.radii[level];
        } else {
            // 配列の範囲外の場合は最後の要素を使用
            outerRadius = this.radii[this.radii.length - 1];
            console.log(`Warning: Level ${level} is out of range for radii array. Using max radius: ${outerRadius}`);
        }
        
        console.log(`Drawing segment: level=${level}, node=${node.name}, type=${node.type}, innerRadius=${innerRadius}, outerRadius=${outerRadius}`);
        
        // D3.js v7 では arc() は関数を返すので、設定後に呼び出す必要がある
        const arcGenerator = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .startAngle(startAngle)
            .endAngle(endAngle)
            .cornerRadius(0);
        
        // パスデータを生成して確認
        const pathData = arcGenerator();
        console.log(`Generated path data for ${node.name} (level=${level}): ${pathData}`);
        
        // セグメントのグループを作成
        const segmentGroup = this.svg.append('g')
            .attr('class', `dial-segment-group level-${level}-segment-group`)
            .attr('data-node-path', nodePath);
        
        // セグメントのパスを描画
        const segment = segmentGroup.append('path')
            .attr('d', pathData)
            .attr('fill', this.calculateColor(node.type, level))
            .attr('stroke', 'white')
            .attr('stroke-width', 1)
            .attr('class', `dial-segment level-${level}-segment`)
            .attr('data-node-path', nodePath);
        
        console.log(`Created segment for ${node.name} (level=${level}, type=${node.type})`);
        
        // セグメントが十分な大きさの場合のみテキストを追加
        const angleSize = endAngle - startAngle;
        const segmentWidth = outerRadius - innerRadius;
        
        // 角度と幅に基づいてテキスト表示を決定
        // サンプル画像に合わせて調整
        const minAngle = 0.05;
        const minWidth = 10;
        
        if (angleSize > minAngle && segmentWidth > minWidth) {
            // テキストの位置を計算
            const textAngle = startAngle + (endAngle - startAngle) / 2;
            const textRadius = innerRadius + (outerRadius - innerRadius) / 2;
            const textX = Math.sin(textAngle) * textRadius;
            const textY = -Math.cos(textAngle) * textRadius;
            
            // テキストサイズを階層と角度に応じて調整
            let fontSize;
            if (level === 1) {
                // 第1階層は大きめのフォント
                fontSize = Math.max(14, Math.min(24, segmentWidth / 4));
            } else {
                // 第2階層以降は小さめのフォント
                fontSize = Math.max(10, Math.min(16, segmentWidth / 6));
            }
            
            console.log(`Adding text for ${node.name} (level=${level}): fontSize=${fontSize}, angle=${textAngle}, radius=${textRadius}`);
            
            // テキストの改行処理
            const text = node.name;
            let displayText = text;
            
            // セグメントの弧の長さを計算（円周の一部）
            const arcLength = angleSize * textRadius;
            
            // 文字の平均幅を推定（フォントサイズの約0.6倍）
            const charWidth = fontSize * 0.6;
            
            // 1行に収まる文字数を計算
            const charsPerLine = Math.floor(arcLength / charWidth);
            
            // 改行が必要かどうかを判断
            if (text.length > charsPerLine && charsPerLine > 2) {
                // 改行を適用
                const lines = [];
                let remainingText = text;
                
                // 最大3行まで改行する
                const maxLines = 3;
                
                for (let i = 0; i < maxLines && remainingText.length > 0; i++) {
                    // 残りの文字が1行に収まる場合
                    if (remainingText.length <= charsPerLine) {
                        lines.push(remainingText);
                        remainingText = '';
                    } else {
                        // 適切な位置で分割
                        let splitPos = charsPerLine;
                        
                        // 単語の途中で切らないように調整（日本語の場合は不要かもしれない）
                        while (splitPos > 0 && !/\s/.test(remainingText.charAt(splitPos))) {
                            splitPos--;
                        }
                        
                        // 適切な分割位置が見つからない場合は強制的に分割
                        if (splitPos === 0 || i === maxLines - 1) {
                            splitPos = charsPerLine;
                        }
                        
                        lines.push(remainingText.substring(0, splitPos));
                        remainingText = remainingText.substring(splitPos).trim();
                    }
                }
                
                // 改行が多すぎる場合（3行以上）は、最後の行に残りのテキストを追加
                if (remainingText.length > 0) {
                    const lastLine = lines[lines.length - 1];
                    lines[lines.length - 1] = lastLine + "...";
                }
                
                // テキストグループを作成（アニメーション時に一緒に動かすため）
                const textGroup = segmentGroup.append('g')
                    .attr('class', 'segment-text-group');
                
                // 複数行のテキストを追加
                lines.forEach((line, i) => {
                    const lineOffset = (i - (lines.length - 1) / 2) * fontSize * 1.2;
                    textGroup.append('text')
                        .attr('x', textX)
                        .attr('y', textY + lineOffset)
                        .attr('text-anchor', 'middle')
                        .attr('dominant-baseline', 'middle')
                        .attr('transform', `rotate(${textAngle * 180 / Math.PI}, ${textX}, ${textY})`)
                        .attr('class', 'segment-label')
                        .attr('font-size', `${fontSize}px`)
                        .attr('fill', 'white')
                        .text(line);
                });
            } else {
                // テキストグループを作成（アニメーション時に一緒に動かすため）
                const textGroup = segmentGroup.append('g')
                    .attr('class', 'segment-text-group');
                
                // 改行なしでテキストを追加
                textGroup.append('text')
                    .attr('x', textX)
                    .attr('y', textY)
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .attr('transform', `rotate(${textAngle * 180 / Math.PI}, ${textX}, ${textY})`)
                    .attr('class', 'segment-label')
                    .attr('font-size', `${fontSize}px`)
                    .attr('fill', 'white')
                    .text(displayText);
            }
            
            console.log(`Added text for ${node.name} (level=${level})`);
        } else {
            console.log(`Skipping text for ${node.name} (level=${level}) - segment too small: angleSize=${angleSize}, segmentWidth=${segmentWidth}`);
        }
        
        return segment;
    }
    
    /**
     * イベントリスナーを設定する
     */
    setupEventListeners() {
        console.log("setupEventListeners: イベントリスナーを設定します");
        
        try {
            // 現在ハイライト中のノードパス
            this.currentHighlightedPath = null;
            
            // ホバー状態を追跡するフラグ
            this.isHovering = false;
            
            // アニメーション中かどうかを追跡するフラグ
            this.isAnimating = false;
            
            // マウスの現在位置
            this.mousePosition = { x: 0, y: 0 };
            
            // 現在ホバー中のセグメント
            this.currentHoveredSegment = null;
            
            // ホバーウィンドウの表示状態
            this.isPopupVisible = false;
            
            // ポップアップにマウスが乗っているかのフラグ
            this.isMouseOverPopup = false;
            
            // ホバーウィンドウの表示タイマー
            this.popupTimer = null;
            
            // ハイライト更新タイマー
            this.highlightTimer = null;
            
            // 次のハイライト状態を保存
            this.pendingHighlightPath = null;
            
            // マウス移動イベントを追跡
            document.addEventListener('mousemove', (event) => {
                this.mousePosition = { x: event.clientX, y: event.clientY };
                
                // マウスが動いた時に、現在のホバー状態を再評価
                if (this.isHovering && this.currentHoveredSegment) {
                    const rect = this.currentHoveredSegment.getBoundingClientRect();
                    if (
                        this.mousePosition.x < rect.left || 
                        this.mousePosition.x > rect.right || 
                        this.mousePosition.y < rect.top || 
                        this.mousePosition.y > rect.bottom
                    ) {
                        // マウスがセグメント外に出た場合、ホバー状態をリセット
                        this.isHovering = false;
                        this.currentHoveredSegment = null;
                        
                        // ポップアップにマウスが乗っていない場合のみ非表示にする
                        if (!this.isMouseOverPopup) {
                            console.log("マウスがセグメントから離れ、ポップアップ上にもないため、ポップアップを非表示にします");
                            this.hideRankingPopup();
                        } else {
                            console.log("マウスがセグメントから離れましたが、ポップアップ上にあるため、ポップアップを表示したままにします");
                        }
                        
                        // ハイライトも更新
                        if (!this.isMouseOverAnySegment() && !this.isMouseOverPopup) {
                            this.scheduleHighlightUpdate(null);
                        }
                    }
                }
            });
            
            // ポップアップのマウスオーバー/アウトイベント
            const popup = document.getElementById("ranking-popup");
            if (popup) {
                popup.addEventListener('mouseenter', () => {
                    console.log("ポップアップにマウスが乗りました");
                    this.isMouseOverPopup = true;
                });
                
                popup.addEventListener('mouseleave', () => {
                    console.log("ポップアップからマウスが離れました");
                    this.isMouseOverPopup = false;
                    
                    // セグメントにもマウスが乗っていない場合はポップアップを非表示
                    if (!this.isHovering && !this.isMouseOverAnySegment()) {
                        console.log("ポップアップからマウスが離れ、セグメント上にもないため、ポップアップを非表示にします");
                        this.hideRankingPopup();
                    } else {
                        console.log("ポップアップからマウスが離れましたが、セグメント上にあるため、ポップアップを表示したままにします");
                    }
                });
            }
            
            // セグメントのクリックイベント
            this.svg.selectAll('.dial-segment')
                .on('click', (event, d) => {
                    console.log("セグメントがクリックされました", event.target);
                    const segment = d3.select(event.target);
                    const nodePath = segment.attr('data-node-path');
                    
                    if (nodePath) {
                        console.log(`クリックされたノードのパス: ${nodePath}`);
                        this.handleSegmentClick(nodePath);
                    }
                });
                
            // 中心円のクリックイベント
            this.svg.select('.dial-center')
                .on('click', (event, d) => {
                    console.log("中心円がクリックされました", event.target);
                    const center = d3.select(event.target);
                    const nodeName = center.attr('data-node-name');
                    
                    if (nodeName) {
                        console.log(`クリックされた中心円のノード名: ${nodeName}`);
                        this.handleSegmentClick(nodeName);
                    }
                });
            
            // セグメントのマウスオーバーイベント
            this.svg.selectAll('.dial-segment-group')
                .on('mouseover', (event, d) => {
                    console.log("セグメントにマウスオーバーしました", event.target);
                    const segmentGroup = d3.select(event.target);
                    const segment = segmentGroup.select('.dial-segment');
                    segment.attr('stroke-width', 2)
                           .attr('stroke', '#333');
                    
                    const nodePath = segmentGroup.attr('data-node-path');
                    if (nodePath) {
                        this.isHovering = true;
                        this.currentHoveredSegment = event.target;
                        
                        // 固定表示中の場合、別のセグメントのハイライトとポップアップ表示をスキップ
                        if (this.isPinned && this.pinnedNodePath !== nodePath) {
                            console.log("別のポップアップが固定表示中のため、ハイライトとポップアップ表示をスキップします");
                            return;
                        }
                        
                        // ハイライトを更新
                        this.scheduleHighlightUpdate(nodePath);
                        
                        // ランキングポップアップを表示
                        this.showRankingPopup(event, nodePath);
                    }
                })
                .on('mouseout', (event, d) => {
                    console.log("セグメントからマウスアウトしました", event.target);
                    const segmentGroup = d3.select(event.target);
                    const segment = segmentGroup.select('.dial-segment');
                    segment.attr('stroke-width', 1)
                           .attr('stroke', 'white');
                    
                    this.isHovering = false;
                    this.currentHoveredSegment = null;
                    
                    // 固定表示中の場合、ハイライトとポップアップの非表示をスキップ
                    if (this.isPinned) {
                        console.log("ポップアップが固定表示中のため、ハイライトとポップアップの非表示をスキップします");
                        return;
                    }
                    
                    // ポップアップにマウスが乗っていない場合のみ非表示にする
                    // 少し遅延を設けて、マウスがポップアップに移動する時間を確保
                    setTimeout(() => {
                        if (!this.isMouseOverPopup && !this.isHovering && !this.isPinned) {
                            console.log("セグメントからマウスが離れ、ポップアップ上にもないため、ポップアップを非表示にします");
                            this.hideRankingPopup();
                        } else {
                            console.log("セグメントからマウスが離れましたが、ポップアップ上にあるため、ポップアップを表示したままにします");
                        }
                        
                        // ハイライトの更新も同様に遅延
                        if (!this.isHovering && !this.isMouseOverAnySegment() && !this.isMouseOverPopup && !this.isPinned) {
                            console.log("マウスがセグメントとポップアップから離れたため、ハイライトをリセットします");
                            this.scheduleHighlightUpdate(null);
                        }
                    }, 100);
                });
            
            // 中心円のマウスオーバーイベント - ハイライト効果を無効化
            this.svg.select('.dial-center')
                .on('mouseover', (event, d) => {
                    console.log("中心円にマウスオーバーしました");
                    const center = d3.select(event.target);
                    // ストロークの変更のみ適用し、拡大効果は適用しない
                    center.attr('stroke-width', 2)
                          .attr('stroke', '#333');
                    
                    const nodeName = center.attr('data-node-name');
                    if (nodeName) {
                        this.isHovering = true;
                        this.currentHoveredSegment = event.target;
                        
                        // 固定表示中の場合、別のセグメントのポップアップ表示をスキップ
                        if (this.isPinned && this.pinnedNodePath !== nodeName) {
                            console.log("別のポップアップが固定表示中のため、ポップアップ表示をスキップします");
                            return;
                        }
                        
                        // 中心円の場合はハイライト更新を行わない
                        // this.scheduleHighlightUpdate(nodeName);
                        
                        // ランキングポップアップを表示
                        this.showRankingPopup(event, nodeName);
                    }
                })
                .on('mouseout', (event, d) => {
                    console.log("中心円からマウスアウトしました");
                    d3.select(event.target)
                        .attr('stroke-width', 2)
                        .attr('stroke', 'white');
                    
                    this.isHovering = false;
                    this.currentHoveredSegment = null;
                    
                    // 固定表示中の場合、ポップアップの非表示をスキップ
                    if (this.isPinned) {
                        console.log("ポップアップが固定表示中のため、ポップアップの非表示をスキップします");
                        return;
                    }
                    
                    // ポップアップにマウスが乗っていない場合のみ非表示にする
                    // 少し遅延を設けて、マウスがポップアップに移動する時間を確保
                    setTimeout(() => {
                        if (!this.isMouseOverPopup && !this.isHovering && !this.isPinned) {
                            console.log("中心円からマウスが離れ、ポップアップ上にもないため、ポップアップを非表示にします");
                            this.hideRankingPopup();
                        } else {
                            console.log("中心円からマウスが離れましたが、ポップアップ上にあるため、ポップアップを表示したままにします");
                        }
                    }, 100);
                    
                    // 中心円の場合はハイライトのリセットを行わない
                });
            
            console.log("イベントリスナーの設定が完了しました");
        } catch (error) {
            console.error("イベントリスナーの設定中にエラーが発生しました:", error);
            console.error(error.stack);
        }
    }
    
    /**
     * ハイライト更新をスケジュールする
     * @param {string|null} nodePath - ハイライトするノードのパス
     */
    scheduleHighlightUpdate(nodePath) {
        console.log(`scheduleHighlightUpdate: ${nodePath}`);
        
        // 現在のパスと同じ場合は何もしない
        if (this.currentHighlightedPath === nodePath && !this.pendingHighlightPath) {
            return;
        }
        
        // 次のハイライト状態を保存
        this.pendingHighlightPath = nodePath;
        
        // アニメーション中でなければすぐに更新
        if (!this.isAnimating) {
            this.updateHighlight();
        }
        // アニメーション中の場合は、アニメーション完了後に更新される
    }
    
    /**
     * ハイライト状態を更新する
     * アニメーションの競合を防ぐために一元管理する
     */
    updateHighlight() {
        console.log(`updateHighlight: currentPath=${this.currentHighlightedPath}, pendingPath=${this.pendingHighlightPath}, isHovering=${this.isHovering}`);
        
        // ハイライトタイマーがあれば解除
        if (this.highlightTimer) {
            clearTimeout(this.highlightTimer);
            this.highlightTimer = null;
        }
        
        // 保留中のパスがあれば、それを現在のパスに設定
        if (this.pendingHighlightPath !== undefined) {
            this.currentHighlightedPath = this.pendingHighlightPath;
            this.pendingHighlightPath = undefined;
        }
        
        // アニメーション中フラグを設定
        this.isAnimating = true;
        
        // 現在のハイライト状態をリセット（アニメーションなし）
        this.resetHighlight(false);
        
        // 新しいハイライトを適用
        if (this.currentHighlightedPath) {
            // 中心円の場合はハイライトしない
            if (this.currentHighlightedPath.split('.').length === 1) {
                console.log("中心円のハイライトはスキップします");
            } else {
                // セグメントの場合
                this.highlightRelatedSegments(this.currentHighlightedPath);
            }
        }
        
        // アニメーション完了後にフラグをリセット
        this.highlightTimer = setTimeout(() => {
            this.isAnimating = false;
            this.highlightTimer = null;
            
            console.log(`Animation completed. isHovering=${this.isHovering}, currentPath=${this.currentHighlightedPath}, pendingPath=${this.pendingHighlightPath}`);
            
            // アニメーション中に新しい状態が設定された場合は再度更新
            if (this.pendingHighlightPath !== undefined) {
                console.log("New highlight state set during animation, updating again");
                this.updateHighlight();
            }
        }, 200); // アニメーション時間と同じに設定
    }
    
    /**
     * いずれかのセグメントにマウスが乗っているかチェック
     * @returns {boolean} いずれかのセグメントにマウスが乗っている場合はtrue
     */
    isMouseOverAnySegment() {
        // セグメントの要素を取得
        const segments = document.querySelectorAll('.dial-segment-group, .dial-center');
        
        // いずれかのセグメントにマウスが乗っているかチェック
        for (const segment of segments) {
            const rect = segment.getBoundingClientRect();
            if (
                this.mousePosition.x >= rect.left && 
                this.mousePosition.x <= rect.right && 
                this.mousePosition.y >= rect.top && 
                this.mousePosition.y <= rect.bottom
            ) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * セグメントクリック時の処理
     * @param {string} nodePath - クリックされたノードのパス
     */
    handleSegmentClick(nodePath) {
        console.log(`handleSegmentClick: ${nodePath}`);
        
        // 既に固定表示されているポップアップがある場合
        if (this.isPinned) {
            // 同じノードがクリックされた場合は固定を解除
            if (this.pinnedNodePath === nodePath) {
                this.unpinPopup();
            }
            // 別のノードがクリックされた場合は何もしない（固定表示中は他のポップアップを表示しない）
            return;
        }
        
        // ポップアップを固定表示
        this.pinPopup(nodePath);
    }
    
    /**
     * ポップアップを固定表示する
     * @param {string} nodePath - 固定表示するノードのパス
     */
    pinPopup(nodePath) {
        console.log(`pinPopup: ${nodePath}`);
        
        // 固定表示状態を設定
        this.isPinned = true;
        this.pinnedNodePath = nodePath;
        
        // ポップアップ要素を取得
        const popup = document.getElementById("ranking-popup");
        if (!popup) return;
        
        // 固定表示用のクラスを追加
        popup.classList.add('pinned');
        
        // ×ボタンがなければ追加
        if (!popup.querySelector('.popup-close-btn')) {
            const closeBtn = document.createElement('div');
            closeBtn.className = 'popup-close-btn';
            closeBtn.textContent = '×';
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // イベントの伝播を停止
                this.unpinPopup();
            });
            popup.appendChild(closeBtn);
        }
        
        // ドラッグアンドドロップ機能を設定
        this.setupDragAndDrop(popup);
    }
    
    /**
     * ポップアップの固定表示を解除する
     */
    unpinPopup() {
        console.log("unpinPopup");
        
        // 固定表示状態をリセット
        this.isPinned = false;
        this.pinnedNodePath = null;
        
        // ポップアップ要素を取得
        const popup = document.getElementById("ranking-popup");
        if (!popup) return;
        
        // 固定表示用のクラスを削除
        popup.classList.remove('pinned');
        
        // ポップアップを非表示
        this.hideRankingPopup();
        
        // ハイライトをリセット
        this.scheduleHighlightUpdate(null);
    }
    
    /**
     * ポップアップのドラッグアンドドロップ機能を設定
     * @param {HTMLElement} popup - ポップアップ要素
     */
    setupDragAndDrop(popup) {
        // ドラッグ開始時の処理
        const onMouseDown = (e) => {
            // ×ボタンがクリックされた場合は何もしない
            if (e.target.classList.contains('popup-close-btn')) return;
            
            this.isDragging = true;
            popup.classList.add('dragging');
            
            // マウス位置とポップアップの位置の差分を計算
            const rect = popup.getBoundingClientRect();
            this.dragOffset = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            
            // イベントリスナーを追加
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            
            // デフォルトの動作とイベントの伝播を防止
            e.preventDefault();
            e.stopPropagation();
        };
        
        // ドラッグ中の処理
        const onMouseMove = (e) => {
            if (!this.isDragging) return;
            
            // ポップアップの新しい位置を計算
            const left = e.clientX - this.dragOffset.x;
            const top = e.clientY - this.dragOffset.y;
            
            // ポップアップが画面外に出ないように調整
            const maxLeft = window.innerWidth - popup.offsetWidth;
            const maxTop = window.innerHeight - popup.offsetHeight;
            
            popup.style.left = `${Math.max(0, Math.min(maxLeft, left))}px`;
            popup.style.top = `${Math.max(0, Math.min(maxTop, top))}px`;
        };
        
        // ドラッグ終了時の処理
        const onMouseUp = () => {
            this.isDragging = false;
            popup.classList.remove('dragging');
            
            // イベントリスナーを削除
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        
        // マウスダウンイベントリスナーを設定
        popup.addEventListener('mousedown', onMouseDown);
    }
    
    /**
     * 関連するセグメントをハイライトする
     * @param {string} nodePath - ノードのパス
     */
    highlightRelatedSegments(nodePath) {
        console.log(`highlightRelatedSegments: ${nodePath}`);
        
        // 全てのセグメントをグレーアウト
        this.svg.selectAll('.dial-segment-group')
            .classed('grayed-out', true)
            .transition()
            .duration(200) // アニメーション時間を調整
            .style('opacity', 0.3);
        
        // 選択されたセグメント自体をハイライト
        this.svg.selectAll(`.dial-segment-group[data-node-path="${nodePath}"]`)
            .classed('grayed-out', false)
            .transition()
            .duration(200) // アニメーション時間を調整
            .style('opacity', 1)
            .attr('transform', 'scale(1.025)') // 拡大移動量を半分に
            .each(function() {
                // 選択されたセグメントを最前面に移動
                this.parentNode.appendChild(this);
            });
        
        // 親セグメントをハイライト
        const pathParts = nodePath.split('.');
        for (let i = 1; i < pathParts.length; i++) {
            const parentPath = pathParts.slice(0, i).join('.');
            this.svg.selectAll(`.dial-segment-group[data-node-path="${parentPath}"]`)
                .classed('grayed-out', false)
                .transition()
                .duration(200) // アニメーション時間を調整
                .style('opacity', 1);
        }
        
        // 子セグメントをハイライト
        this.svg.selectAll(`.dial-segment-group[data-node-path^="${nodePath}."]`)
            .classed('grayed-out', false)
            .transition()
            .duration(200) // アニメーション時間を調整
            .style('opacity', 1);
    }
    
    /**
     * 全てのセグメントをハイライトする（中心円を除く）
     */
    highlightAll() {
        console.log("highlightAll - 中心円を除く全てのセグメントをハイライト");
        
        // 中心円は変更しない
        
        // 全てのセグメントをハイライト（中心円を除く）
        this.svg.selectAll('.dial-segment-group')
            .classed('grayed-out', false)
            .transition()
            .duration(200) // アニメーション時間を調整
            .style('opacity', 1)
            .attr('transform', 'scale(1.025)'); // 拡大移動量を半分に
    }
    
    /**
     * ハイライトをリセットする
     * @param {boolean} animate - アニメーションを適用するかどうか
     */
    resetHighlight(animate = true) {
        console.log("resetHighlight");
        
        // 中心円のハイライトを解除
        const centerTransition = this.svg.select('.dial-center');
        if (animate) {
            centerTransition.transition().duration(200);
        }
        centerTransition.attr('transform', 'scale(1)');
        
        // 全てのセグメントのグレーアウトを解除
        const segmentTransition = this.svg.selectAll('.dial-segment-group')
            .classed('grayed-out', false);
        
        if (animate) {
            segmentTransition.transition().duration(200);
        }
        
        segmentTransition
            .style('opacity', 1)
            .attr('transform', 'scale(1)');
        
        // 元の表示順を復元
        if (animate) {
            // 表示順を元に戻すためにレベル順にソート
            this.restoreOriginalOrder();
        }
    }
    
    /**
     * 元の表示順を復元する
     */
    restoreOriginalOrder() {
        // レベル0（中心円）
        this.svg.select('.dial-center').each(function() {
            // SVGの先頭に移動（最背面）
            const parent = this.parentNode;
            parent.insertBefore(this, parent.firstChild);
        });
        
        // レベル1から順に並べ直す
        for (let level = 1; level <= 3; level++) {
            this.svg.selectAll(`.level-${level}-segment-group`).each(function() {
                const parent = this.parentNode;
                // 同じレベルのセグメントを同じ表示順にする
                parent.appendChild(this);
            });
        }
    }
    
    /**
     * ランキングポップアップを表示する
     * @param {Event} event - イベント
     * @param {string} nodePath - ノードのパス
     */
    showRankingPopup(event, nodePath) {
        console.log(`showRankingPopup: ${nodePath}`);
        
        // 固定表示中の場合、別のノードのポップアップは表示しない
        if (this.isPinned && this.pinnedNodePath !== nodePath) {
            console.log("別のポップアップが固定表示中のため、表示をスキップします");
            return;
        }
        
        // 既存のポップアップ要素を取得
        const popup = document.getElementById("ranking-popup");
        const rankingTitle = document.getElementById("ranking-title");
        const rankingContent = document.getElementById("ranking-content");
        
        if (!popup || !rankingTitle || !rankingContent) {
            console.error("ランキングポップアップの要素が見つかりません");
            return;
        }
        
        // 固定表示中の場合は位置を変更しない
        if (this.isPinned && this.pinnedNodePath === nodePath) {
            console.log("ポップアップは既に固定表示されています");
            return;
        }
        
        // タイトルを設定
        rankingTitle.textContent = this.formatNodePath(nodePath);
        
        // コンテンツをクリア
        rankingContent.innerHTML = "<p>データを読み込んでいます...</p>";
        
        // 一時的にポップアップを表示して実際のサイズを取得
        popup.style.display = 'block';
        popup.style.visibility = 'hidden'; // 見えないように設定
        popup.style.left = '0px';
        popup.style.top = '0px';
        
        // 実際のポップアップサイズを取得
        const popupWidth = popup.offsetWidth;
        const popupHeight = popup.offsetHeight;
        
        // ビューポートのサイズを取得
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // マウス位置を取得
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        
        // ポップアップの位置を計算
        let left, top;
        
        // 水平方向の位置を決定
        // 右側に十分なスペースがある場合はマウスの右側に表示
        if (mouseX + 20 + popupWidth <= viewportWidth) {
            left = mouseX + 20; // マウスの右側に表示
        } 
        // 左側に十分なスペースがある場合はマウスの左側に表示
        else if (mouseX - 20 - popupWidth >= 0) {
            left = mouseX - 20 - popupWidth; // マウスの左側に表示
        } 
        // どちらにも十分なスペースがない場合は中央寄りに表示
        else {
            left = Math.max(10, Math.min(viewportWidth - popupWidth - 10, mouseX - popupWidth / 2));
        }
        
        // 垂直方向の位置を決定
        // 下側に十分なスペースがある場合はマウスの下側に表示
        if (mouseY + 20 + popupHeight <= viewportHeight) {
            top = mouseY + 20; // マウスの下側に表示
        } 
        // 上側に十分なスペースがある場合はマウスの上側に表示
        else if (mouseY - 20 - popupHeight >= 0) {
            top = mouseY - 20 - popupHeight; // マウスの上側に表示
        } 
        // どちらにも十分なスペースがない場合は中央寄りに表示
        else {
            top = Math.max(10, Math.min(viewportHeight - popupHeight - 10, mouseY - popupHeight / 2));
        }
        
        // 最終的な位置を設定
        popup.style.left = `${left}px`;
        popup.style.top = `${top}px`;
        popup.style.visibility = 'visible'; // 再び可視化
        
        // ポップアップを表示（アニメーション付き）
        popup.classList.add('visible');
        
        // ポップアップが表示されていることを記録
        this.isPopupVisible = true;
        
        // ランキングデータを表示
        setTimeout(() => {
            this.showPathRanking(nodePath, rankingContent);
        }, 10);
    }
    
    /**
     * ランキングポップアップを非表示にする
     */
    hideRankingPopup() {
        console.log("hideRankingPopup");
        
        // 固定表示中の場合は非表示にしない
        if (this.isPinned) {
            console.log("ポップアップが固定表示中のため、非表示にしません");
            return;
        }
        
        // ポップアップにマウスが乗っている場合は非表示にしない
        if (this.isMouseOverPopup) {
            console.log("ポップアップにマウスが乗っているため、非表示にしません");
            return;
        }
        
        const popup = document.getElementById("ranking-popup");
        if (popup) {
            popup.classList.remove('visible');
            
            // アニメーション終了後に非表示に
            setTimeout(() => {
                if (!this.isMouseOverPopup && !this.isHovering && !this.isPinned) {
                    popup.style.display = 'none';
                    this.isPopupVisible = false;
                }
            }, 300);
        }
    }
    
    /**
     * ノードパスをフォーマットする
     * @param {string} nodePath - ノードのパス
     * @returns {string} フォーマットされたノードパス
     */
    formatNodePath(nodePath) {
        if (!nodePath) return "不明";
        
        const parts = nodePath.split('.');
        
        if (parts.length === 1) {
            // 中心
            return parts[0];
        } else if (parts.length === 2) {
            // 分野
            return `${parts[1]}分野のアプリケーション`;
        } else if (parts.length === 3) {
            // フェーズ
            return `${parts[1]}分野の${parts[2]}フェーズ`;
        } else if (parts.length === 4) {
            // カテゴリ
            return `${parts[1]}分野の${parts[2]}フェーズ・${parts[3]}カテゴリ`;
        } else if (parts.length === 5) {
            // サブカテゴリ
            return `${parts[1]}分野の${parts[2]}フェーズ・${parts[3]}カテゴリ・${parts[4]}`;
        }
        
        return nodePath;
    }
    
    /**
     * パスに対応するランキングを表示する
     * @param {string} nodePath - ノードのパス
     * @param {HTMLElement} container - コンテナ要素
     */
    showPathRanking(nodePath, container) {
        console.log(`showPathRanking: ${nodePath}`);
        
        // アプリケーションデータを取得
        const apps = this.getAppsByPath(nodePath);
        
        if (!apps || apps.length === 0) {
            container.innerHTML = "<p>このセグメントに該当するアプリケーションはありません。<br>CSVデータに該当する項目が含まれていない可能性があります。</p>";
            return;
        }
        
        // 上位10件を表示
        this.renderRankingItems(apps.slice(0, 10), container);
    }
    
    /**
     * パスに対応するアプリケーションを取得する
     * @param {string} nodePath - ノードのパス
     * @returns {Array} アプリケーションの配列
     */
    getAppsByPath(nodePath) {
        console.log(`getAppsByPath: ${nodePath}`);
        
        if (!this.data || !this.data.appsByPath) {
            console.log("データが存在しないため、デモアプリケーションを生成します");
            return this.generateDemoApps(nodePath);
        }
        
        // パスの各部分を取得
        const parts = nodePath.split('.');
        console.log(`ノードパスの分割結果: ${parts.join(', ')}`);
        
        // 実際のデータからアプリケーションを取得
        let filteredApps = [];
        
        // ノードパス（ドット区切り）をappsByPathのキー形式（スラッシュ区切り）に変換
        let appPathKey = '';
        
        // 中心の場合は全てのアプリケーションを返す
        if (parts.length === 1) {
            console.log("中心ノードが選択されました。すべてのアプリケーションを集計します。");
            // 中心の場合は全てのアプリケーションを集める
            Object.keys(this.data.appsByPath).forEach(path => {
                if (this.data.appsByPath[path] && Array.isArray(this.data.appsByPath[path])) {
                    filteredApps.push(...this.data.appsByPath[path]);
                    console.log(`パス「${path}」から ${this.data.appsByPath[path].length} 件のアプリを追加しました`);
                }
            });
        } 
        // 分野レベル
        else if (parts.length === 2) {
            const field = parts[1];
            console.log(`分野「${field}」が選択されました`);
            // 指定された分野に関連するすべてのパスを検索
            Object.keys(this.data.appsByPath).forEach(path => {
                if (path.startsWith(field + '/')) {
                    if (this.data.appsByPath[path] && Array.isArray(this.data.appsByPath[path])) {
                        filteredApps.push(...this.data.appsByPath[path]);
                        console.log(`パス「${path}」から ${this.data.appsByPath[path].length} 件のアプリを追加しました`);
                    }
                }
            });
        }
        // フェーズレベル
        else if (parts.length === 3) {
            const field = parts[1];
            const phase = parts[2];
            console.log(`分野「${field}」、フェーズ「${phase}」が選択されました`);
            // 指定された分野とフェーズに関連するすべてのパスを検索
            Object.keys(this.data.appsByPath).forEach(path => {
                if (path.startsWith(`${field}/${phase}/`)) {
                    if (this.data.appsByPath[path] && Array.isArray(this.data.appsByPath[path])) {
                        filteredApps.push(...this.data.appsByPath[path]);
                        console.log(`パス「${path}」から ${this.data.appsByPath[path].length} 件のアプリを追加しました`);
                    }
                }
            });
        }
        // カテゴリレベル
        else if (parts.length === 4) {
            const field = parts[1];
            const phase = parts[2];
            const category = parts[3];
            console.log(`分野「${field}」、フェーズ「${phase}」、カテゴリ「${category}」が選択されました`);
            // 指定されたパスに完全に一致するパスを検索
            appPathKey = `${field}/${phase}/${category}`;
            if (this.data.appsByPath[appPathKey] && Array.isArray(this.data.appsByPath[appPathKey])) {
                filteredApps = this.data.appsByPath[appPathKey];
                console.log(`パス「${appPathKey}」から ${filteredApps.length} 件のアプリを取得しました`);
            } else {
                // 前方一致で検索
                Object.keys(this.data.appsByPath).forEach(path => {
                    if (path.startsWith(appPathKey + '/')) {
                        if (this.data.appsByPath[path] && Array.isArray(this.data.appsByPath[path])) {
                            filteredApps.push(...this.data.appsByPath[path]);
                            console.log(`パス「${path}」から ${this.data.appsByPath[path].length} 件のアプリを追加しました`);
                        }
                    }
                });
            }
        }
        // サブカテゴリレベル
        else if (parts.length === 5) {
            const field = parts[1];
            const phase = parts[2];
            const category = parts[3];
            const subcategory = parts[4];
            console.log(`分野「${field}」、フェーズ「${phase}」、カテゴリ「${category}」、サブカテゴリ「${subcategory}」が選択されました`);
            // 指定されたパスに完全に一致するパスを検索
            appPathKey = `${field}/${phase}/${category}/${subcategory}`;
            if (this.data.appsByPath[appPathKey] && Array.isArray(this.data.appsByPath[appPathKey])) {
                filteredApps = this.data.appsByPath[appPathKey];
                console.log(`パス「${appPathKey}」から ${filteredApps.length} 件のアプリを取得しました`);
            }
        }
        
        console.log(`合計 ${filteredApps.length} 件のアプリケーションが見つかりました`);
        
        // 売上順にソート
        filteredApps.sort((a, b) => b.sales - a.sales);
        
        return filteredApps;
    }
    
    /**
     * 売上額の文字列を数値に変換する
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
     * デモアプリケーションを生成する
     * @param {string} nodePath - ノードのパス
     * @returns {Array} アプリケーションの配列
     */
    generateDemoApps(nodePath) {
        console.log(`generateDemoApps: ${nodePath} のデモデータを生成します`);
        
        const apps = [];
        const appCount = Math.floor(Math.random() * 8) + 3; // 3〜10個のアプリケーション
        
        // パスに基づいてアプリケーション名のプレフィックスを決定
        let appPrefixes = [];
        const parts = nodePath.split('.');
        
        if (parts.length >= 4) { // カテゴリレベル以上
            const category = parts[3];
            
            // カテゴリに基づいてプレフィックスを設定
            if (category === '意匠') {
                appPrefixes = ["BIM", "CAD", "3Dモデリング", "デザイン", "レンダリング"];
            } else if (category === '構造') {
                appPrefixes = ["構造解析", "耐震設計", "構造計算", "FEM解析", "構造BIM"];
            } else if (category === '設備') {
                appPrefixes = ["設備設計", "空調設計", "電気設計", "配管設計", "MEP"];
            } else if (category === '施工総合管理') {
                appPrefixes = ["施工管理", "現場管理", "工事管理", "施工BIM", "4D-BIM"];
            } else if (category === '工程管理') {
                appPrefixes = ["工程管理", "スケジューラ", "ガントチャート", "進捗管理", "工程最適化"];
            } else if (category === '原価管理') {
                appPrefixes = ["原価管理", "コスト管理", "予算管理", "見積", "コスト分析"];
            } else if (category === '品質管理') {
                appPrefixes = ["品質管理", "検査", "品質チェック", "不具合管理", "品質分析"];
            } else if (category === '安全管理') {
                appPrefixes = ["安全管理", "リスク管理", "安全教育", "事故防止", "安全分析"];
            } else {
                appPrefixes = ["BIM", "CAD", "管理", "設計", "分析"];
            }
        } else if (parts.length >= 3) { // フェーズレベル
            const phase = parts[2];
            
            // フェーズに基づいてプレフィックスを設定
            if (phase === '設計') {
                appPrefixes = ["BIM", "CAD", "3Dモデリング", "構造解析", "設備設計"];
            } else if (phase === '施工') {
                appPrefixes = ["施工管理", "工程管理", "原価管理", "品質管理", "安全管理"];
            } else if (phase === '維持管理') {
                appPrefixes = ["保全管理", "点検", "修繕計画", "資産管理", "ファシリティ"];
            } else {
                appPrefixes = ["BIM", "CAD", "管理", "設計", "分析"];
            }
        } else {
            // デフォルトのプレフィックス
            appPrefixes = [
                "BIM", "CAD", "3Dモデリング", "構造解析", "設備設計", 
                "施工管理", "工程管理", "原価管理", "品質管理", "安全管理"
            ];
        }
        
        // 会社名のリスト
        const companies = [
            "建設ソフト株式会社", "デジタル建築研究所", "BIMテクノロジー", "構造計算システムズ",
            "施工管理ソリューションズ", "建設ITサービス", "デジタル現場", "スマート建設", 
            "建築DXラボ", "次世代建設テクノロジー"
        ];
        
        // デモアプリケーションを生成
        for (let i = 0; i < appCount; i++) {
            const prefix = appPrefixes[Math.floor(Math.random() * appPrefixes.length)];
            const appName = `${prefix}${String.fromCharCode(65 + i)}`;
            const company = companies[Math.floor(Math.random() * companies.length)];
            const sales = Math.floor(Math.random() * 900000000) + 100000000; // 1億〜10億円
            
            apps.push({
                name: appName,
                company: company,
                sales: sales
            });
        }
        
        // 売上順にソート
        apps.sort((a, b) => b.sales - a.sales);
        
        console.log(`${apps.length}件のデモアプリケーションを生成しました`);
        
        return apps;
    }
    
    /**
     * ランキング項目をレンダリングする
     * @param {Array} apps - アプリケーションの配列
     * @param {HTMLElement} container - コンテナ要素
     */
    renderRankingItems(apps, container) {
        console.log(`renderRankingItems: ${apps.length}件のアプリケーション`);
        
        if (apps.length === 0) {
            container.innerHTML = "<p>データがありません</p>";
            return;
        }
        
        // コンテナの内容をクリア（「データを読み込んでいます...」を削除）
        container.innerHTML = '';
        
        // 最大売上額を取得
        const maxSales = Math.max(...apps.map(app => app.sales));
        
        // 各アプリケーションを表示
        apps.forEach((app, index) => {
            const item = document.createElement("div");
            item.className = "ranking-item";
            
            // 製品名と会社名を表示
            const name = document.createElement("div");
            name.className = "ranking-name";
            
            // 製品名を表示（最大40文字まで）
            const displayName = app.name || "不明";
            
            // 会社名がある場合は表示（URLは削除）
            let companyText = app.company || '';
            let cleanCompany = companyText.replace(/\s*\(https?:\/\/[^\)]+\)\s*/g, '');
            cleanCompany = cleanCompany.replace(/https?:\/\/\S+/g, '').trim();
            
            // 製品名と会社名を結合した文字列
            let fullText = `${index + 1}. ${displayName}`;
            if (cleanCompany) {
                fullText += ` (${cleanCompany})`;
            }
            
            // 文字数が多い場合は省略
            if (fullText.length > 40) {
                name.textContent = fullText.substring(0, 40) + '...';
            } else {
                name.textContent = fullText;
            }
            
            // ツールチップを追加（製品名が長い場合や説明がある場合）
            let tooltipContent = `${displayName}`;
            
            // 会社名（元のURL付き）をツールチップに追加
            if (app.company) {
                tooltipContent += ` (${app.company})`;
            }
            
            if (app.description) {
                tooltipContent += `\n${app.description}`;
            }
            
            // URLはツールチップにのみ表示
            if (app.url) {
                tooltipContent += `\nURL: ${app.url}`;
            }
            
            item.title = tooltipContent;
            
            // URLがある場合はクリック可能にする
            if (app.url) {
                item.style.cursor = 'pointer';
                item.addEventListener('click', () => {
                    window.open(app.url, '_blank');
                });
            }
            
            const barContainer = document.createElement("div");
            barContainer.className = "ranking-bar-container";
            
            const bar = document.createElement("div");
            bar.className = "ranking-bar";
            bar.style.width = `${(app.sales / maxSales) * 100}%`;
            
            const value = document.createElement("div");
            value.className = "ranking-value";
            value.textContent = this.formatSales(app.sales);
            
            barContainer.appendChild(bar);
            item.appendChild(name);
            item.appendChild(barContainer);
            item.appendChild(value);
            
            container.appendChild(item);
        });
    }
    
    /**
     * 売上額をフォーマットする
     * @param {number} sales - 売上額
     * @returns {string} フォーマットされた売上額
     */
    formatSales(sales) {
        if (sales === 0) return "不明";
        
        if (sales >= 100000000) {
            return `${(sales / 100000000).toFixed(1)}億円`;
        } else if (sales >= 10000) {
            return `${(sales / 10000).toFixed(0)}万円`;
        } else {
            return `${sales.toFixed(0)}円`;
        }
    }
} 