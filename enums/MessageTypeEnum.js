const MessageTypeEnum = Object.freeze({
    DEBUG: 'queue-e::debug|',
    LOG:   'queue-e::log|',
    WARN:  'queue-e::warn|',
    ERROR: 'queue-e::error|',
    UPDATE: 'queue-e::update|',
});

export { MessageTypeEnum as default };