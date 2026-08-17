const mockRendererInstance = () => ({
    templateContent: '',

    setTemplateById: jest.fn(),
    setTemplateByScriptId: jest.fn(),

    addRecord: jest.fn(),
    addCustomDataSource: jest.fn(),

    renderAsPdf: jest.fn(() => ({
        name: 'mock.pdf',
        fileType: 'PDF',
        size: 1024,
        getContents: jest.fn(() => 'PDF_BINARY_CONTENT')
    })),

    renderAsString: jest.fn(() => '<pdf>Mock PDF Content</pdf>')
});

module.exports = {
    create: jest.fn(() => mockRendererInstance()),

    xmlToPdf: jest.fn(({ xmlString }) => ({
        name: 'mock.pdf',
        fileType: 'PDF',
        getContents: jest.fn(() => xmlString)
    })),

    RenderType: {
        PDF: 'PDF',
        HTML: 'HTML'
    },

    DataSource: {
        OBJECT: 'OBJECT',
        RECORD: 'RECORD',
        FILE: 'FILE'
    }
};
