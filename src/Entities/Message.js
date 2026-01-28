{
  "name": "Message",
  "type": "object",
  "properties": {
    "recipient_email": {
      "type": "string",
      "description": "Email du destinataire"
    },
    "sender_name": {
      "type": "string",
      "description": "Nom de l'exp\u00e9diteur"
    },
    "content": {
      "type": "string",
      "description": "Contenu du message"
    },
    "is_read": {
      "type": "boolean",
      "default": false,
      "description": "Message lu"
    }
  },
  "required": [
    "recipient_email",
    "sender_name",
    "content"
  ]
}
