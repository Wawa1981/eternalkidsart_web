
  "name": "PostComment",
  "type": "object",
  "properties": {
    "post_id": {
      "type": "string",
      "description": "ID du post"
    },
    "content": {
      "type": "string",
      "description": "Contenu du commentaire"
    },
    "author_name": {
      "type": "string",
      "description": "Nom de l'auteur"
    }
  },
  "required": [
    "post_id",
    "content",
    "author_name"
  ]
}
