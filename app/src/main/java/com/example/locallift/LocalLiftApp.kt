package com.example.locallift

import android.app.Application
import com.example.locallift.data.AppDatabase
import com.example.locallift.data.repository.LocalLiftRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob

class LocalLiftApp : Application() {
    private val applicationScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    val database by lazy { AppDatabase.getDatabase(this, applicationScope) }
    val repository by lazy { LocalLiftRepository(database.localLiftDao()) }
}
