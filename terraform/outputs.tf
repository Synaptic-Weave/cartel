output "database_id" {
  value       = google_firestore_database.default.name
  description = "The name/ID of the default Firestore database"
}

output "database_location" {
  value       = google_firestore_database.default.location_id
  description = "The geographical location of the Firestore database instance"
}

output "project_services" {
  value = [
    google_project_service.firestore.service,
    google_project_service.identitytoolkit.service,
    google_project_service.firebase.service
  ]
  description = "The list of bootstrapped and enabled GCP services"
}

# -------------------------------------------------------------
# Firebase Client SDK Credentials Configuration Block
# -------------------------------------------------------------

output "firebase_config" {
  value = {
    apiKey            = data.google_firebase_web_app_config.default.api_key
    authDomain        = data.google_firebase_web_app_config.default.auth_domain
    projectId         = var.project_id
    storageBucket     = data.google_firebase_web_app_config.default.storage_bucket
    messagingSenderId = data.google_firebase_web_app_config.default.messaging_sender_id
    appId             = google_firebase_web_app.default.app_id
  }
  description = "The client SDK credentials used to initialize the frontend interface"
}
