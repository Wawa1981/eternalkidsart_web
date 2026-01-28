
  "name": "Post",
  "type": "object",
  "properties": {
    "content": {
      "type": "string",
      "description": "Contenu du post"
    },
    "image_url": {
      "type": "string",
      "description": "Image optionnelle du post"
    },
    "drawing_id": {
      "type": "string",
      "description": "ID du dessin partag\u00e9 (optionnel)"
    },
    "author_name": {
      "type": "string",
      "description": "Nom de l'auteur"
    },
    "likes_count": {
      "type": "number",
      "default": 0,
      "description": "Nombre de likes"
    },
    "comments_count": {
      "type": "number",
      "default": 0,
      "description": "Nombre de commentaires"
    }
  },
  "required": [
    "content",
    "author_name"
  ]
}
