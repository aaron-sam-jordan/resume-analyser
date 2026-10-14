from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from auth.routes import auth_bp
from analyser.routes import analyser_bp
from admin.routes import admin_bp


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = Config.SECRET_KEY
    app.config["MAX_CONTENT_LENGTH"] = Config.MAX_CONTENT_LENGTH

    CORS(app, origins=[Config.FRONTEND_URL])

    app.register_blueprint(auth_bp)
    app.register_blueprint(analyser_bp)
    app.register_blueprint(admin_bp)

    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok"})

    @app.errorhandler(413)
    def too_large(e):
        return jsonify({"error": f"File is too large. The limit is {Config.MAX_UPLOAD_MB} MB."}), 413

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Not found."}), 404

    @app.errorhandler(405)
    def wrong_method(e):
        return jsonify({"error": "Method not allowed."}), 405

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Something went wrong on the server."}), 500

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)