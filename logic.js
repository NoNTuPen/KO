// logic.js - Обработчик таблиц книгообеспеченности с сохранением шапки

class DocTableProcessor {
    constructor() {
        this.tables = [];
        this.currentFile = null;
        this.processedHtml = '';
        this.fullDocument = ''; // Сохраняем весь документ
        this.originalDocumentStructure = ''; // Сохраняем структуру документа с шапкой
        
        this.initElements();
        this.initEventListeners();
        this.initDragAndDrop();
    }
    
    initElements() {
        // Основные элементы
        this.dropZone = document.getElementById('dropZone');
        this.fileInput = document.getElementById('fileInput');
        this.selectFileBtn = document.getElementById('selectFileBtn');
        this.fileInfo = document.getElementById('fileInfo');
        this.tablesList = document.getElementById('tablesList');
        this.tablesCount = document.getElementById('tablesCount');
        this.processedCount = document.getElementById('processedCount');
        this.processAllBtn = document.getElementById('processAllBtn');
        this.previewHtmlBtn = document.getElementById('previewHtmlBtn');
        
        // Модальные окна
        this.previewModal = document.getElementById('previewModal');
        this.previewHtml = document.getElementById('previewHtml');
        this.previewIframe = document.getElementById('previewIframe');
        this.copyHtmlBtn = document.getElementById('copyHtmlBtn');
        this.downloadHtmlBtn = document.getElementById('downloadHtmlBtn');
        this.printHtmlBtn = document.getElementById('printHtmlBtn');
        this.printCardsBtn = document.getElementById('printCardsBtn');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        this.closePreviewBtn = document.getElementById('closePreviewBtn');
        
        // Табы предпросмотра
        this.previewTabs = document.querySelectorAll('.preview-tab');
        this.previewContents = document.querySelectorAll('.preview-content');
        
        // Информационная панель
        this.docInfoPanel = document.getElementById('docInfoPanel');
        this.tablesFooter = document.getElementById('tablesFooter');
        
        // Кнопки управления таблицами (скрываем)
        const expandAllBtn = document.getElementById('expandAllBtn');
        const collapseAllBtn = document.getElementById('collapseAllBtn');
        if (expandAllBtn) expandAllBtn.style.display = 'none';
        if (collapseAllBtn) collapseAllBtn.style.display = 'none';
    }
    
    initEventListeners() {
        // Загрузка файлов
        this.selectFileBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Drag & drop зона
        this.dropZone.addEventListener('click', () => this.fileInput.click());
        
        // Кнопки управления
        this.processAllBtn.addEventListener('click', () => this.processAllTables());
        this.previewHtmlBtn.addEventListener('click', () => this.showHtmlPreview());
        
        // Кнопки в модальном окне
        if (this.copyHtmlBtn) {
            this.copyHtmlBtn.addEventListener('click', () => this.copyHtmlToClipboard());
        }
        
        if (this.downloadHtmlBtn) {
            this.downloadHtmlBtn.addEventListener('click', () => this.downloadHtml());
        }

        if (this.printHtmlBtn) {
            this.printHtmlBtn.addEventListener('click', () => this.printHtml());
        }
        
        if (this.printCardsBtn) {
            this.printCardsBtn.addEventListener('click', () => this.printCards());
        }

        // Кнопки закрытия модального окна
        if (this.closeModalBtn) {
            this.closeModalBtn.addEventListener('click', () => this.closeAllModals());
        }
        
        if (this.closePreviewBtn) {
            this.closePreviewBtn.addEventListener('click', () => this.closeAllModals());
        }
        
        // Табы предпросмотра
        this.previewTabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.switchPreviewTab(e));
        });
        
        const downloadDocxBtn = document.getElementById('downloadDocxBtn');
        if (downloadDocxBtn) {
            downloadDocxBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.downloadAsDocx();
            });
        }
    }
    
    initDragAndDrop() {
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('drag-over');
        });
        
        this.dropZone.addEventListener('dragleave', () => {
            this.dropZone.classList.remove('drag-over');
        });
        
        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('drag-over');
            
            const file = e.dataTransfer.files[0];
            if (file && (file.name.endsWith('.html') || file.name.endsWith('.htm'))) {
                this.handleFile(file);
            } else {
                alert('Пожалуйста, загрузите HTML файл');
            }
        });
    }
    
    async handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            await this.handleFile(file);
        }
    }
    
/**
 * Печать HTML документа с правильными полями и шрифтами
 */
printHtml() {
    // Создаем временное окно для печати
    const printWindow = window.open('', '_blank');
    
    // Получаем HTML для печати
    let printContent = this.previewHtml.value;
    
    // Удаляем лишние теги html/head/body если они есть
    printContent = printContent
        .replace('<!DOCTYPE html>', '')
        .replace('<html>', '')
        .replace('</html>', '')
        .replace('<head>', '')
        .replace('</head>', '')
        .replace('<body>', '')
        .replace('</body>', '');
    
    // Записываем содержимое с оптимизированными стилями для печати
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Книгообеспеченность - печать</title>
            <style>
                /* Базовые стили для экрана и печати */
                body { 
                    font-family: 'Times New Roman', Times, serif; 
                    font-size: 14pt; /* Устанавливаем 14pt шрифт */
                    line-height: 1.3;
                    margin: 0;
                    padding: 0;
                }
                
                table { 
                    border-collapse: collapse; 
                    width: 100%; 
                    margin-bottom: 20px;
                }
                
                td, th { 
                    padding: 8px; 
                    vertical-align: top;
                }
                
                /* Стили только для печати */
                @media print {
                    @page {
                        size: A4;
                    }
                    
                    body { 
                        font-family: 'Times New Roman', Times, serif; 
                        font-size: 14pt; /* 14pt шрифт */
                        line-height: 1.3;
                        margin: 0;
                        padding: 0;
                        width: 100%;
                    }
                    
                    table { 
                        border-collapse: collapse; 
                        width: 100%; 
                        margin-bottom: 20px;
                        page-break-inside: avoid; /* Запрещаем разрыв таблицы */
                        table-layout: fixed; /* Фиксированная ширина колонок */
                    }
                    
                    /* Все ячейки с данными и заголовками имеют границы */
                    td, th { 
                        border: 1px solid #000000;
                        padding: 8px;
                        vertical-align: top;
                        font-size: 14pt; /* 14pt в ячейках */
                        word-wrap: break-word; /* Перенос слов */
                    }
                    
                    /* Шапка документа БЕЗ ГРАНИЦ */
                    tr:first-child td,
                    tr:first-child th,
                    tr:nth-child(2) td,
                    tr:nth-child(2) th,
                    td:contains("Дисциплина:"),
                    td:contains("Кафедра:"),
                    td:contains("Книгообеспеченность"),
                    td:contains("Согласовано"),
                    td:contains("Зав. кафедрой") {
                        border: none !important;
                    }
                    
                    /* Строки с дисциплиной и кафедрой без границ */
                    tr:has(td:contains("Дисциплина:")),
                    tr:has(td:contains("Кафедра:")),
                    tr:has(td:contains("Книгообеспеченность")),
                    tr:has(td:contains("Согласовано")),
                    tr:has(td:contains("Зав. кафедрой")) {
                        border: none;
                    }
                    
                    tr:has(td:contains("Дисциплина:")) td,
                    tr:has(td:contains("Кафедра:")) td,
                    tr:has(td:contains("Книгообеспеченность")) td,
                    tr:has(td:contains("Согласовано")) td,
                    tr:has(td:contains("Зав. кафедрой")) td {
                        border: none !important;
                        font-size: 14pt;
                    }
                    
                    /* Заголовки колонок с границами и жирным шрифтом */
                    tr:has(td:contains("Группа")),
                    tr:has(th:contains("Группа")) {
                        font-weight: bold;
                    }
                    
                    tr:has(td:contains("Группа")) td,
                    tr:has(th:contains("Группа")) th {
                        border: 1px solid #000000 !important;
                        background-color: #f0f0f0;
                        font-weight: bold;
                    }
                    
                    /* Подвал без границ */
                    .FOOTER,
                    .footer-row,
                    tr:has(td.FOOTER),
                    tr.footer-row {
                        border: none !important;
                    }
                    
                    .FOOTER td,
                    .footer-row td,
                    tr:has(td.FOOTER) td,
                    tr.footer-row td {
                        border: none !important;
                        text-align: right;
                        font-style: italic;
                        font-size: 14pt;
                    }
                    
                    /* Предотвращаем обрезание контента */
                    * {
                        box-sizing: border-box;
                    }
                    
                    /* Гарантируем, что таблица не вылезает за поля */
                    table {
                        max-width: 100%;
                    }
                }
                
                /* Стили для экрана (предпросмотр) */
                body { 
                    font-family: 'Times New Roman', Times, serif; 
                    font-size: 14pt;
                    margin: 2cm;
                }
                
                table { 
                    border-collapse: collapse; 
                    width: 100%; 
                    margin-bottom: 20px;
                }
                
                td, th { 
                    padding: 8px; 
                    vertical-align: top;
                }
            </style>
        </head>
        <body>
            ${printContent}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    
    // Даем время на загрузку стилей
    setTimeout(() => {
        // Открываем диалог печати с настройками
        printWindow.print();
        // Не закрываем окно, чтобы пользователь мог настроить параметры
    }, 500);
}

/**
 * Обновленный метод showHtmlPreview с правильным шрифтом
 */
showHtmlPreview() {
    if (this.tables.length === 0) {
        alert('Сначала загрузите файл с таблицами');
        return;
    }
    
    // Собираем все обработанные таблицы
    let tablesHtml = '';
    this.tables.forEach(table => {
        if (table.processed) {
            tablesHtml += table.element.outerHTML + '\n<br><br>\n';
        }
    });
    
    // Если нет обработанных таблиц, обрабатываем все
    if (!tablesHtml) {
        this.processAllTables();
        tablesHtml = '';
        this.tables.forEach(table => {
            if (table.processed) {
                tablesHtml += table.element.outerHTML + '\n<br><br>\n';
            }
        });
    }
    
    tablesHtml = this.removeAllPageNumbers(tablesHtml);
    
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Книгообеспеченность</title>
    <style>
        /* Основные стили для предпросмотра */
        body { 
            font-family: 'Times New Roman', Times, serif; 
            font-size: 14pt; /* 14pt шрифт */
            margin: 2cm;
            line-height: 1.3;
        }
        
        table { 
            border-collapse: collapse; 
            width: 100%; 
            margin-bottom: 20px;
        }
        
        td, th { 
            padding: 8px; 
            vertical-align: top;
            font-size: 14pt; /* 14pt в ячейках */
        }
        
        /* Стили для печати (дублируем для iframe) */
        @media print {
            @page {
                size: A4;
            }
            
            body { 
                font-size: 14pt;
                margin: 0;
                padding: 0;
            }
            
            table { 
                page-break-inside: avoid;
                table-layout: fixed;
                width: 100%;
            }
            
            td, th { 
                border: 1px solid #000;
                font-size: 14pt;
                word-wrap: break-word;
            }
            
            /* Шапка без границ */
            tr:has(td:contains("Дисциплина:")),
            tr:has(td:contains("Кафедра:")),
            tr:has(td:contains("Книгообеспеченность")),
            tr:has(td:contains("Согласовано")),
            tr:has(td:contains("Зав. кафедрой")) {
                border: none;
            }
            
            tr:has(td:contains("Дисциплина:")) td,
            tr:has(td:contains("Кафедра:")) td,
            tr:has(td:contains("Книгообеспеченность")) td,
            tr:has(td:contains("Согласовано")) td,
            tr:has(td:contains("Зав. кафедрой")) td {
                border: none !important;
            }
            
            .FOOTER td,
            .footer-row td {
                border: none !important;
                text-align: right;
                font-style: italic;
            }
        }
        
        /* Стили для шапки без границ в предпросмотре */
        tr:has(td:contains("Дисциплина:")),
        tr:has(td:contains("Кафедра:")),
        tr:has(td:contains("Книгообеспеченность")),
        tr:has(td:contains("Согласовано")),
        tr:has(td:contains("Зав. кафедрой")) {
            border: none;
        }
        
        tr:has(td:contains("Дисциплина:")) td,
        tr:has(td:contains("Кафедра:")) td,
        tr:has(td:contains("Книгообеспеченность")) td,
        tr:has(td:contains("Согласовано")) td,
        tr:has(td:contains("Зав. кафедрой")) td {
            border: none !important;
        }
        
        .FOOTER {
            text-align: right;
            font-style: italic;
            border: none !important;
        }
        
        .footer-row td {
            border: none !important;
        }
        
        /* Заголовки колонок */
        tr:has(td:contains("Группа")),
        tr:has(th:contains("Группа")) {
            font-weight: bold;
        }
        
        tr:has(td:contains("Группа")) td,
        tr:has(th:contains("Группа")) th {
            border: 1px solid #000000 !important;
            background-color: #f0f0f0;
        }
    </style>
</head>
<body>
    ${tablesHtml}
</body>
</html>`;
    
    this.previewHtml.value = fullHtml;
    this.previewIframe.srcdoc = fullHtml;
    
    // Показываем модальное окно
    this.previewModal.classList.add('active');
    
    // Переключаем на вкладку с предпросмотром
    const previewTab = document.querySelector('[data-tab="preview"]');
    if (previewTab) {
        previewTab.click();
    }
}

    switchPreviewTab(e) {
        const tab = e.target;
        const tabName = tab.dataset.tab;
        
        // Обновляем активный таб
        this.previewTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Обновляем контент
        this.previewContents.forEach(content => content.classList.remove('active'));
        
        if (tabName === 'code') {
            document.getElementById('previewCode').classList.add('active');
        } else {
            document.getElementById('previewRender').classList.add('active');
            // Обновляем iframe
            this.previewIframe.srcdoc = this.previewHtml.value;
        }
    }

    async downloadAsDocx() {
        // Проверяем наличие обработанных таблиц
        if (this.tables.length === 0 || !this.tables.some(t => t.processed)) {
            alert('Сначала обработайте таблицы');
            return;
        }
        
        try {
            // Находим кнопку и отключаем её
            const downloadBtn = document.getElementById('downloadDocxBtn');
            const originalText = downloadBtn?.innerHTML || '📥 DOCX';
            
            if (downloadBtn) {
                downloadBtn.innerHTML = '⏳ Конвертация...';
                downloadBtn.disabled = true;
            }
            
            // Получаем HTML для конвертации
            const docxHtml = this.getHtmlForDocx();
            
            // Проверяем, доступна ли библиотека docshift
            if (typeof docshift === 'undefined') {
                throw new Error('Библиотека docshift не загружена');
            }
            
            // Конвертируем в DOCX
            const docxBlob = await docshift.toDocx(docxHtml);
            
            // Скачиваем файл
            const url = URL.createObjectURL(docxBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'knigoobespechennost_' + new Date().toISOString().slice(0,10) + '.docx';
            a.click();
            URL.revokeObjectURL(url);
            
            // Восстанавливаем кнопку
            if (downloadBtn) {
                downloadBtn.innerHTML = originalText;
                downloadBtn.disabled = false;
            }
            
        } catch (error) {
            console.error('Ошибка конвертации в DOCX:', error);
            alert('Ошибка при создании DOCX: ' + error.message);
            
            // Восстанавливаем кнопку
            const downloadBtn = document.getElementById('downloadDocxBtn');
            if (downloadBtn) {
                downloadBtn.innerHTML = '📥 DOCX';
                downloadBtn.disabled = false;
            }
        }
    }
    
    /**
     * Создает HTML для конвертации в DOCX
     */
    getHtmlForDocx() {
        let tablesHtml = '';
        
        this.tables.forEach((table, tableIndex) => {
            if (table.processed) {
                // Получаем обработанную таблицу
                tablesHtml += table.element.outerHTML;
                
                // Добавляем небольшой отступ между таблицами
                if (tableIndex < this.tables.length - 1) {
                    tablesHtml += '<br><br>';
                }
            }
        });
        
        // Удаляем номера страниц
        tablesHtml = this.removeAllPageNumbers(tablesHtml);
        
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Книгообеспеченность</title>
    <style>
        body { 
            font-family: 'Times New Roman', Times, serif; 
            font-size: 12pt;
        }
        table { 
            border-collapse: collapse; 
            width: 100%; 
            margin-bottom: 10px;
            page-break-inside: avoid;
        }
    </style>
</head>
<body>
    ${tablesHtml}
</body>
</html>`;
    }
    
    /**
     * Удаляет все номера страниц из HTML
     */
    removeAllPageNumbers(html) {
        // Удаляем строки с "стр."
        let cleaned = html.replace(/<tr[^>]*>.*?стр\.\s*\d+.*?<\/tr>/gi, '');
        
        // Удаляем ячейки с "стр."
        cleaned = cleaned.replace(/<td[^>]*>.*?стр\.\s*\d+.*?<\/td>/gi, '');
        
        // Удаляем текст "стр. X"
        cleaned = cleaned.replace(/>\s*стр\.\s*\d+\s*</gi, '><');
        
        // Удаляем пустые строки
        cleaned = cleaned.replace(/<tr>\s*<\/tr>/gi, '');
        
        return cleaned;
    }
    
    async handleFile(file) {
        this.currentFile = file;
        
        // Обновляем информацию о файле
        document.querySelector('.file-name').textContent = `📄 ${file.name}`;
        
        // Читаем файл
        const reader = new FileReader();
        reader.onload = async (e) => {
            let html = e.target.result;
            
            // Сохраняем оригинальную структуру документа
            this.originalDocumentStructure = html;
            
            // ОЧИЩАЕМ HTML ОТ СЛУЖЕБНЫХ СТРОК
            html = this.cleanHtml(html);
            
            this.fullDocument = html;
            await this.parseHtml(html);
        };
        reader.readAsText(file);
    }
    
    /**
     * Очищает HTML от служебных конструкций
     */
    cleanHtml(html) {
        // Удаляем объявления CSS вне тегов style
        let cleaned = html.replace(/P\.breakhere\s*\{[^}]+\}/g, '');
        
        // Удаляем другие возможные служебные объявления
        cleaned = cleaned.replace(/\.[a-zA-Z]+\.[a-zA-Z]+\s*\{[^}]+\}/g, '');
        
        // Удаляем пустые строки в начале
        cleaned = cleaned.replace(/^\s+/, '');
        
        return cleaned;
    }
    
    async parseHtml(html) {
        // Создаем временный DOM для парсинга
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Ищем все таблицы с данными
        const tables = doc.querySelectorAll('table');
        this.tables = [];
        let lastDepartment = null;
        
        tables.forEach((table, index) => {
            // Проверяем, есть ли в таблице строки с данными
            const rows = table.querySelectorAll('tr');
            let hasDataRows = false;
            
            for (let row of rows) {
                const cells = row.querySelectorAll('td');
                // Ищем строки с данными (должно быть много колонок)
                if (cells.length >= 8) {
                    const firstCell = cells[0]?.textContent.trim();
                    const secondCell = cells[1]?.textContent.trim();
                    const thirdCell = cells[2]?.textContent.trim();
                    
                    // Проверяем разные варианты строк с данными
                    const hasGroup = firstCell && /^[А-Я]{2,3}-\d{2}/.test(firstCell);
                    const hasCourseAndStudents = secondCell && /^\d+$/.test(secondCell) && 
                                                thirdCell && /^\d+\/\d+$/.test(thirdCell);
                    const isEmptyGroupWithData = (!firstCell || firstCell === '') && 
                                                secondCell && thirdCell;
                    
                    if (hasGroup || hasCourseAndStudents || isEmptyGroupWithData) {
                        hasDataRows = true;
                        break;
                    }
                }
            }
            
            if (hasDataRows) {
                // Извлекаем название дисциплины из таблицы
                const disciplineName = this.extractDisciplineName(table);
                let department = this.extractDepartmentName(table);
            if (department && department !== 'Кафедра не указана') {
                lastDepartment = department; // обновляем глобальную
            } else {
                // если не нашли, используем предыдущую
                department = lastDepartment || 'Кафедра не указана';
            }
                
                this.tables.push({
                    id: `table-${index}`,
                    element: table.cloneNode(true),
                    originalHtml: table.outerHTML,
                    expanded: true,
                    processed: false,
                    discipline: disciplineName || `Таблица ${index + 1}`,
                    department: department 
                });
            }
        });
        
        console.log('Всего найдено таблиц:', this.tables.length);
        
        // Показываем информационную панель
        if (this.tables.length > 0) {
            this.docInfoPanel.style.display = 'block';
        }
        
        // Обновляем интерфейс
        this.renderTables();
        this.updateButtons();
    }
    

    /**
 * Извлекает все строки данных из оригинальной таблицы.
 * Возвращает массив объектов с полями:
 *   students, mainLit, addLit, methodLit, eumk, ko
 */
extractDataRowsFromTable(tableElement) {
    const rows = tableElement.querySelectorAll('tr');
    const dataRows = [];

    for (let row of rows) {
        const cells = row.querySelectorAll('td');
        if (cells.length < 8) continue;

        // Проверяем, является ли строка строкой данных (наличие курса и студентов)
        const secondCell = cells[1]?.textContent.trim();
        const thirdCell = cells[2]?.textContent.trim();
        const hasCourse = secondCell && /^\d+$/.test(secondCell);
        const hasStudents = thirdCell && /^\d+\/\d+$/.test(thirdCell);
        if (!(hasCourse && hasStudents)) continue;

        // Извлекаем значения (индексы могут отличаться, но обычно так)
        const students = cells[2]?.textContent.trim() || '0/0';
        const mainLit = cells[3]?.textContent.trim() || '0/0';
        const addLit = cells[4]?.textContent.trim() || '0/0';
        const methodLit = cells[5]?.textContent.trim() || '0/0';
        const eumk = cells[6]?.textContent.trim() || '0/0';
        let ko = cells[7]?.textContent.trim() || '';

        // Если КО отсутствует – рассчитываем (по аналогии с processTable)
        if (!ko) {
            const [before, after] = students.split('/').map(Number);
            const studentsForKo = before > 0 ? before : after;
            const mainParts = mainLit.split('/');
            let mainCount = 0;
            if (mainParts.length >= 2) {
                mainCount = parseInt(mainParts[1].replace(/,/g, '')) || 0;
            }
            ko = studentsForKo > 0 ? (mainCount / (studentsForKo * 0.2)).toFixed(2) : '0.00';
        }

        dataRows.push({ students, mainLit, addLit, methodLit, eumk, ko });
    }

    return dataRows;
}

printCards() {
    if (this.tables.length === 0) {
        alert('Сначала загрузите файл с таблицами');
        return;
    }

    const unprocessed = this.tables.filter(t => !t.processed);
    if (unprocessed.length > 0) {
        if (confirm('Есть необработанные таблицы. Обработать их сейчас?')) {
            this.processAllTables();
        } else {
            return;
        }
    }

    const processedTables = this.tables.filter(t => t.processed);
    if (processedTables.length === 0) {
        alert('Нет обработанных таблиц для печати карточек');
        return;
    }

    let cardsHtml = '';

    processedTables.forEach(table => {
        const tableEl = table.element;
        if (!tableEl) return;

        const rows = tableEl.querySelectorAll('tr');
        let dataRows = [];

        for (let row of rows) {
            const cells = row.querySelectorAll('td');
            // Строка данных содержит 8 ячеек и не является строкой заголовка
            if (cells.length === 8 && !row.textContent.includes('Группа')) {
                dataRows.push(row);
            }
        }

        if (dataRows.length === 0) {
            console.warn('Не найдены строки данных в таблице', table.discipline);
            return;
        }

        let tableRowsHtml = '';
        dataRows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const group = cells[0]?.textContent.trim() || '';
            const course = cells[1]?.textContent.trim() || '';
            const students = cells[2]?.textContent.trim() || '';
            const mainLit = cells[3]?.textContent.trim() || '';
            const addLit = cells[4]?.textContent.trim() || '';
            const methodLit = cells[5]?.textContent.trim() || '';
            const eumk = cells[6]?.textContent.trim() || '';
            const ko = cells[7]?.textContent.trim() || '';

            tableRowsHtml += `
                <tr>
                    <td>${group}</td>
                    <td>${course}</td>
                    <td>${students}</td>
                    <td>${mainLit}</td>
                    <td>${addLit}</td>
                    <td>${methodLit}</td>
                    <td>${eumk}</td>
                    <td>${ko}</td>
                </tr>
            `;
        });

        cardsHtml += `
            <div class="card">
                <div class="card-content">
                    <div class="card-field">Год 2025/2026</div>
                    <div class="card-field">Кафедра "${table.department}"</div>
                    <div class="card-field discipline">Дисциплина "${table.discipline}"</div>
                    <table class="card-table">
                        <thead>
                            <tr>
                                <th>Группа</th>
                                <th>Курс</th>
                                <th>К-во ст.(до/зо)</th>
                                <th>ОЛ</th>
                                <th>ДЛ</th>
                                <th>МУ</th>
                                <th>ЭУМК</th>
                                <th>КО</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRowsHtml}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    });

    if (!cardsHtml) {
        alert('Не удалось сформировать карточки');
        return;
    }

    const printDoc = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Карточки книгообеспеченности</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            min-height: 100vh;
        }
        .card {
            width: 125mm;
            height: 75mm;
            box-sizing: border-box;
            margin: 2mm auto;
            border: 1px solid #000;
            page-break-inside: avoid;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: 'Times New Roman', Times, serif;
            font-size: 10pt;
            line-height: 1.2;
            padding: 3mm;
        }
        .card-content {
            width: 100%;
            max-width: 115mm;
        }
        .card-field {
            text-align: left;
            margin-bottom: 2mm;
            font-weight: normal;
        }
        .discipline {
            white-space: normal;
            word-wrap: break-word;
        }
        .card-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 2mm;
            font-size: 8pt;
        }
        .card-table th, .card-table td {
            border: 1px solid #000;
            padding: 1px 2px;
            text-align: center;
            word-break: break-word;
        }
        .card-table th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        @media print {
            body { margin: 0; padding: 0; }
            .card { margin: 0 auto; border: 1px solid #000; }
        }
    </style>
</head>
<body>
    ${cardsHtml}
</body>
</html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printDoc);
    printWindow.document.close();
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

extractDepartmentName(tableElement) {
    const rows = tableElement.querySelectorAll('tr');
    for (let row of rows) {
        const cells = row.querySelectorAll('td, th');
        for (let cell of cells) {
            const text = cell.textContent || '';
            // Ищем "Кафедра:" и захватываем всё после двоеточия до конца строки
            const match = text.match(/Кафедра[:\s]*([^\n\r]+)/i);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
        // Также проверяем текст всей строки на случай, если кафедра без ячейки (например, объединение)
        const rowText = row.textContent || '';
        const rowMatch = rowText.match(/Кафедра[:\s]*([^\n\r]+)/i);
        if (rowMatch && rowMatch[1]) {
            return rowMatch[1].trim();
        }
    }
    return null; // вернём null, чтобы понять, что не нашли
}

    /**
     * Извлекает название дисциплины из таблицы (УЛУЧШЕННАЯ ВЕРСИЯ)
     */
    extractDisciplineName(tableElement) {
        const rows = tableElement.querySelectorAll('tr');
        
        // Сначала ищем строку, содержащую "Дисциплина:"
        for (let row of rows) {
            const cells = row.querySelectorAll('td, th');
            const rowText = row.textContent || '';
            
            // Проверяем всю строку на наличие "Дисциплина:"
            if (rowText.includes('Дисциплина:')) {
                // Ищем во всех ячейках этой строки
                for (let cell of cells) {
                    const cellText = cell.textContent || '';
                    if (cellText.includes('Дисциплина:')) {
                        // Извлекаем текст после "Дисциплина:"
                        const match = cellText.match(/Дисциплина:\s*(.+?)(?:\n|$)/i);
                        if (match && match[1]) {
                            let discipline = match[1].trim();
                            // Убираем лишние символы и цифры в начале
                            discipline = discipline.replace(/^\d+\.\s*/, '');
                            return discipline;
                        }
                        
                        // Если не сработала регулярка, просто берем текст после "Дисциплина:"
                        const disciplineIndex = cellText.indexOf('Дисциплина:');
                        if (disciplineIndex !== -1) {
                            let discipline = cellText.substring(disciplineIndex + 11).trim();
                            // Убираем лишние символы
                            discipline = discipline.replace(/^\d+\.\s*/, '');
                            return discipline;
                        }
                    }
                }
            }
            
            // Проверяем, может быть дисциплина в строке без метки, но с типичными названиями
            const disciplineKeywords = [
                'Алгоритмы', 'Математика', 'Информатика', 'Физика', 
                'Программирование', 'Базы данных', 'Операционные системы',
                'Компьютерные сети', 'WEB', 'Python', 'Java', 'C++',
                'Аналитическая геометрия', 'Линейная алгебра', 'Дискретная математика'
            ];
            
            for (let keyword of disciplineKeywords) {
                if (rowText.includes(keyword)) {
                    // Проверяем, что это не слишком длинная строка
                    if (rowText.length < 100) {
                        return rowText.trim();
                    }
                    // Если строка длинная, ищем в ячейках
                    for (let cell of cells) {
                        const cellText = cell.textContent || '';
                        if (cellText.includes(keyword) && cellText.length < 80) {
                            return cellText.trim();
                        }
                    }
                }
            }
        }
        
        // Если ничего не нашли, пробуем найти в первых строках таблицы
        for (let i = 0; i < Math.min(5, rows.length); i++) {
            const row = rows[i];
            const cells = row.querySelectorAll('td, th');
            const rowText = row.textContent || '';
            
            // Ищем строку, которая похожа на название дисциплины (не слишком длинная, без цифр в начале)
            if (rowText.length > 10 && rowText.length < 100 && 
                !rowText.includes('Кафедра:') && !rowText.includes('Группа') &&
                !rowText.includes('Количество студентов')) {
                
                // Проверяем, что в строке есть буквы и она не начинается с цифры
                if (/[а-яА-Я]/.test(rowText) && !/^\d/.test(rowText.trim())) {
                    return rowText.trim();
                }
            }
        }
        
        return null;
    }
    
    renderTables() {
        if (this.tables.length === 0) {
            this.tablesList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <p>Таблиц с данными не найдено</p>
                    <p class="small">Убедитесь, что в файле есть таблицы с группами (ИП-21, ПО-31 и т.д.)</p>
                </div>
            `;
            this.tablesCount.textContent = '0';
            this.processedCount.textContent = '0';
            return;
        }
        
        let html = '';
        const processedCount = this.tables.filter(t => t.processed).length;
        
        this.tables.forEach((table) => {
            const processedBadge = table.processed ? '✅' : '⏳';
            const disciplineName = table.discipline || 'Таблица';
            
            html += `
                <div class="table-card" data-table-id="${table.id}">
                    <div class="table-header" onclick="processor.toggleTable('${table.id}')">
                        <div class="table-title">
                            <span class="discipline-name">${processedBadge} ${disciplineName}</span>
                        </div>
                        <div class="table-controls">
                            ${!table.processed ? 
                                `<button class="btn btn-small" onclick="processor.processTable('${table.id}'); event.stopPropagation();">
                                    ⚡ Обработать
                                </button>` : 
                                `<span class="processed-badge">✓ Обработано</span>`
                            }
                            <button class="btn btn-small btn-danger" onclick="processor.removeTable('${table.id}'); event.stopPropagation();">
                                ✕
                            </button>
                        </div>
                    </div>
                    <div class="table-content ${table.expanded ? '' : 'collapsed'}">
                        <div class="table-wrapper">
                            ${this.renderTablePreview(table.element)}
                        </div>
                    </div>
                </div>
            `;
        });
        
        this.tablesList.innerHTML = html;
        this.tablesCount.textContent = this.tables.length;
        this.processedCount.textContent = processedCount;
    }
    
    renderTablePreview(tableElement) {
        // Создаем копию для предпросмотра
        const clone = tableElement.cloneNode(true);
        
        // Оставляем только первые 3 строки данных для предпросмотра
        const rows = clone.querySelectorAll('tr');
        let dataRowsCount = 0;
        let rowsToShow = [];
        
        // Находим строки с данными
        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].querySelectorAll('td');
            if (cells.length >= 8) {
                const firstCell = cells[0]?.textContent.trim();
                if (firstCell && /^[А-Я]{2,3}-\d{2}/.test(firstCell)) {
                    dataRowsCount++;
                    if (dataRowsCount <= 3) {
                        rowsToShow.push(rows[i]);
                    }
                }
            }
        }
        
        // Скрываем все строки, потом показываем нужные
        rows.forEach(row => row.style.display = 'none');
        
        // Показываем строки с дисциплиной и кафедрой
        for (let row of rows) {
            const text = row.textContent || '';
            if (text.includes('Дисциплина:') || text.includes('Кафедра:') || 
                text.includes('Книгообеспеченность') || text.includes('Согласовано') ||
                text.includes('Зав. кафедрой')) {
                row.style.display = '';
            }
        }
        
        // Показываем заголовки колонок
        for (let row of rows) {
            const text = row.textContent || '';
            if (text.includes('Группа') && text.includes('Количество студентов')) {
                row.style.display = '';
                break;
            }
        }
        
        // Показываем строки с данными (первые 3)
        rowsToShow.forEach(row => row.style.display = '');
        
        let preview = clone.outerHTML;
        
        if (dataRowsCount > 3) {
            preview += `<div class="preview-note">... и еще ${dataRowsCount - 3} строк</div>`;
        }
        
        return preview;
    }
    
    processTable(tableId) {
        const table = this.tables.find(t => t.id === tableId);
        if (!table || table.processed) return;
    
        const parser = new DOMParser();
        const doc = parser.parseFromString(table.element.outerHTML, 'text/html');
        const tableElement = doc.querySelector('table');
        if (!tableElement) return;
    
        const rows = Array.from(tableElement.querySelectorAll('tr'));
    
        // Разделяем на шапку, данные, подвал
        let headerRows = [];
        let dataRows = [];
        let footerRow = null;
        let headerColumnsRow = null;
    
        for (let row of rows) {
            const cells = row.querySelectorAll('td, th');
            const text = row.textContent;
    
            if (text.includes('стр.') || row.querySelector('.FOOTER')) {
                footerRow = row;
                continue;
            }
    
            if (text.includes('Группа') && text.includes('Количество студентов')) {
                headerColumnsRow = row;
                continue;
            }
    
            if (cells.length >= 8) {
                const secondCell = cells[1]?.textContent.trim();
                const thirdCell = cells[2]?.textContent.trim();
                
                const hasCourse = secondCell && /^\d+$/.test(secondCell);
                const hasStudents = thirdCell && /^\d+\/\d+$/.test(thirdCell);
                
                if (hasCourse && hasStudents) {
                    dataRows.push(row);
                    continue;
                }
            }
    
            headerRows.push(row);
        }
    
        if (dataRows.length === 0) return;
    
        // Суммируем студентов
        let totalBefore = 0;
        let totalAfter = 0;
    
        dataRows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 3) {
                const studentVal = cells[2]?.textContent.trim() || '0/0';
                const parts = studentVal.split('/');
                const before = parseInt(parts[0]) || 0;
                const after = parseInt(parts[1]) || 0;
                
                totalBefore += before;
                totalAfter += after;
            }
        });
    
        // Определяем студентов для КО
        let studentsForKo = totalBefore > 0 ? totalBefore : totalAfter;
    
        // Берём литературу из ПЕРВОЙ строки
        const firstRow = dataRows[0];
        const firstCells = firstRow.querySelectorAll('td');
    
        const mainLitRaw = firstCells[3]?.textContent.trim() || '0/0';
        const mainParts = mainLitRaw.split('/');
        let mainCount = 0;
        
        if (mainParts.length >= 2) {
            const countStr = mainParts[1].trim().replace(/,/g, '');
            mainCount = parseInt(countStr) || 0;
        }
    
        // Рассчитываем КО
        let koValue = studentsForKo > 0 ? (mainCount / (studentsForKo * 0.2)).toFixed(2) : '0.00';
    
        // ===== СТРОИМ НОВУЮ ТАБЛИЦУ =====
        let newTableHtml = '<table style="border-collapse: collapse; width: 100%;">\n';
    
        // Шапка (БЕЗ ГРАНИЦ)
        headerRows.forEach(row => {
            if (!row.textContent.includes('стр.')) {
                newTableHtml += '<tr>\n';
                const cells = row.querySelectorAll('td, th');
                cells.forEach(cell => {
                    const attrs = [];
                    if (cell.hasAttribute('colspan')) attrs.push(`colspan="${cell.getAttribute('colspan')}"`);
                    if (cell.hasAttribute('rowspan')) attrs.push(`rowspan="${cell.getAttribute('rowspan')}"`);
                    if (cell.hasAttribute('align')) attrs.push(`align="${cell.getAttribute('align')}"`);
                    
                    // Для шапки - БЕЗ ГРАНИЦ
                    attrs.push('style="border: none; padding: 4px 8px;"');
                    
                    let content = cell.innerHTML;
                    content = content.replace(/стр\.\s*\d+/gi, '');
                    
                    newTableHtml += `<td ${attrs.join(' ')}>${content}</td>\n`;
                });
                newTableHtml += '</tr>\n';
            }
        });
    
        // Заголовки колонок (С ГРАНИЦАМИ)
        if (headerColumnsRow) {
            newTableHtml += '<tr>\n';
            const cells = headerColumnsRow.querySelectorAll('td, th');
            cells.forEach(cell => {
                newTableHtml += `<td style="border: 1px solid #000000; padding: 8px; font-weight: bold;">${cell.innerHTML}</td>\n`;
            });
            newTableHtml += '</tr>\n';
        }
    
        // Данные (С ГРАНИЦАМИ)
        dataRows.forEach((row, idx) => {
            const cells = row.querySelectorAll('td');
            const group = cells[0]?.textContent.trim() || '';
            const course = cells[1]?.textContent.trim() || '';
            
            newTableHtml += '<tr>\n';
            
            // Группа - С ГРАНИЦЕЙ
            newTableHtml += `<td style="border: 1px solid #000000; padding: 8px;">${group}</td>\n`;
            // Курс - С ГРАНИЦЕЙ
            newTableHtml += `<td style="border: 1px solid #000000; padding: 8px;">${course}</td>\n`;
    
            if (idx === 0) {
                // Первая строка - все ячейки с границами
                newTableHtml += `<td style="border: 1px solid #000000; padding: 8px;">${totalBefore}/${totalAfter}</td>\n`;
                newTableHtml += `<td style="border: 1px solid #000000; padding: 8px;">${mainLitRaw}</td>\n`;
                newTableHtml += `<td style="border: 1px solid #000000; padding: 8px;">${firstCells[4]?.textContent.trim() || '0/0'}</td>\n`;
                newTableHtml += `<td style="border: 1px solid #000000; padding: 8px;">${firstCells[5]?.textContent.trim() || '0/0'}</td>\n`;
                newTableHtml += `<td style="border: 1px solid #000000; padding: 8px;">${firstCells[6]?.textContent.trim() || '0/0'}</td>\n`;
                newTableHtml += `<td style="border: 1px solid #000000; padding: 8px;">${koValue}</td>\n`;
            } else {
                // Остальные строки - пустые ячейки, НО С ГРАНИЦАМИ
                newTableHtml += `<td style="border: 1px solid #000000; padding: 8px;">&nbsp;</td>\n`;
                newTableHtml += `<td style="border: 1px solid #000000; padding: 8px;">&nbsp;</td>\n`;
                newTableHtml += `<td style="border: 1px solid #000000; padding: 8px;">&nbsp;</td>\n`;
                newTableHtml += `<td style="border: 1px solid #000000; padding: 8px;">&nbsp;</td>\n`;
                newTableHtml += `<td style="border: 1px solid #000000; padding: 8px;">&nbsp;</td>\n`;
                newTableHtml += `<td style="border: 1px solid #000000; padding: 8px;">&nbsp;</td>\n`;
            }
    
            newTableHtml += '</tr>\n';
        });
    
        // Подвал (без границ)
        if (footerRow && !footerRow.textContent.includes('стр.')) {
            newTableHtml += '<tr>\n';
            const cells = footerRow.querySelectorAll('td');
            cells.forEach(cell => {
                const colspan = cell.hasAttribute('colspan') ? ` colspan="${cell.getAttribute('colspan')}"` : '';
                const align = cell.getAttribute('align') ? ` align="${cell.getAttribute('align')}"` : '';
                
                newTableHtml += `<td${colspan}${align} style="border: none; padding: 4px 8px;">${cell.innerHTML}</td>\n`;
            });
            newTableHtml += '</tr>\n';
        }
    
        newTableHtml += '</table>';
    
        const newDoc = parser.parseFromString(newTableHtml, 'text/html');
        table.element = newDoc.querySelector('table');
        table.processed = true;
    
        this.renderTables();
        this.updateButtons();
    }
    
    /**
     * Обработать все таблицы (ТОЛЬКО ОБРАБОТКА, БЕЗ СКАЧИВАНИЯ)
     */
    processAllTables() {
        if (this.tables.length === 0) {
            alert('Сначала загрузите файл с таблицами');
            return;
        }
        
        let processed = 0;
        this.tables.forEach(table => {
            if (!table.processed) {
                this.processTable(table.id);
                processed++;
            }
        });
        
        if (processed > 0) {
            alert(`Обработано ${processed} таблиц`);
        } else {
            alert('Все таблицы уже обработаны');
        }
    }
    
    /**
     * Показать предпросмотр HTML
     */
    showHtmlPreview() {
        if (this.tables.length === 0) {
            alert('Сначала загрузите файл с таблицами');
            return;
        }
        
        // Собираем все обработанные таблицы
        let tablesHtml = '';
        this.tables.forEach(table => {
            if (table.processed) {
                tablesHtml += table.element.outerHTML + '\n<br><br>\n';
            }
        });
        
        // Если нет обработанных таблиц, обрабатываем все
        if (!tablesHtml) {
            this.processAllTables();
            tablesHtml = '';
            this.tables.forEach(table => {
                if (table.processed) {
                    tablesHtml += table.element.outerHTML + '\n<br><br>\n';
                }
            });
        }
        
        tablesHtml = this.removeAllPageNumbers(tablesHtml);
        
        const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Книгообеспеченность</title>
    <style>
        body { 
            font-family: 'Times New Roman', Times, serif; 
            font-size: 12pt;
        }
        table { 
            border-collapse: collapse; 
            width: 100%; 
            margin-bottom: 20px;
        }
        td, th { 
            padding: 8px; 
            vertical-align: top;
        }
        .FOOTER {
            text-align: right;
            font-style: italic;
        }
    </style>
</head>
<body>
    ${tablesHtml}
</body>
</html>`;
        
        this.previewHtml.value = fullHtml;
        this.previewIframe.srcdoc = fullHtml;
        
        // Показываем модальное окно
        this.previewModal.classList.add('active');
        
        // Переключаем на вкладку с предпросмотром
        document.querySelector('[data-tab="preview"]').click();
    }
    
    /**
     * Копировать HTML в буфер обмена
     */
    copyHtmlToClipboard() {
        this.previewHtml.select();
        document.execCommand('copy');
        alert('HTML скопирован в буфер обмена');
    }
    
    /**
     * Скачать HTML
     */
    downloadHtml() {
        const blob = new Blob([this.previewHtml.value], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'knigoobespechennost_' + new Date().toISOString().slice(0,10) + '.html';
        a.click();
        URL.revokeObjectURL(url);
    }
    
    /**
     * Управление отображением таблиц
     */
    toggleTable(tableId) {
        const table = this.tables.find(t => t.id === tableId);
        if (table) {
            table.expanded = !table.expanded;
            this.renderTables();
        }
    }
    
    /**
     * Удалить таблицу
     */
    removeTable(tableId) {
        this.tables = this.tables.filter(t => t.id !== tableId);
        this.renderTables();
        this.updateButtons();
        
        if (this.tables.length === 0) {
            this.docInfoPanel.style.display = 'none';
        }
    }
    
    /**
     * Обновить состояние кнопок
     */
    updateButtons() {
        const hasTables = this.tables.length > 0;
        const hasProcessed = this.tables.some(t => t.processed);
        
        this.processAllBtn.disabled = !hasTables;
        this.previewHtmlBtn.disabled = !hasTables;
        
        const downloadBtn = document.getElementById('downloadDocxBtn');
        if (downloadBtn) {
            downloadBtn.disabled = !hasProcessed;
        }
    }
    
    /**
     * Закрыть все модальные окна
     */
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }
}

// Инициализация при загрузке страницы
let processor;
document.addEventListener('DOMContentLoaded', () => {
    processor = new DocTableProcessor();
    window.processor = processor;
});
