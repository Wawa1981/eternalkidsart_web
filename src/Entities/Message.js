{
  "name": "Message",
  "type": "object",
  "properties": {
    "recipient_email": {
      "type": "string",
      "description": "Email du destinataire"
    },
    "sender_email": {
      "type": "string",
      "description": "Email de l'expéditeur"
    },
    "sender_name": {
      "type": "string",
      "description": "Nom de l'expéditeur"
    },
    "content": {
      "type": "string",
      "description": "Contenu du message"
    },
    "is_read": {
      "type": "boolean",
      "default": false,
      "description": "Message lu"
    },
    "deleted_by_sender": {
      "type": "boolean",
      "default": false,
      "description": "Masqué par l'expéditeur (soft delete)"
    },
    "deleted_by_recipient": {
      "type": "boolean",
      "default": false,
      "description": "Masqué par le destinataire (soft delete)"
    }
  },
  "required": [
    "recipient_email",
    "sender_email",
    "sender_name",
    "content"
  ]
}
