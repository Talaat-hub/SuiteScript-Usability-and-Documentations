module.exports = {

    toRecord: jest.fn((options = {}) => {
        return {
            type: options.type,
            id: options.id,
            isEditMode: options.isEditMode ?? false
        };
    }),

    toSuitelet: jest.fn((options = {}) => {
        return {
            scriptId: options.scriptId,
            deploymentId: options.deploymentId,
            parameters: options.parameters || {}
        };
    }),
    
    toTaskLink: jest.fn((options = {}) => {
        return {
            id: options.id,
            parameters: options.parameters || {}
        };
    })
};