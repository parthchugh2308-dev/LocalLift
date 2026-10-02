package com.example.locallift.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.example.locallift.data.dao.LocalLiftDao
import com.example.locallift.data.model.CartItemEntity
import com.example.locallift.data.model.OfferEntity
import com.example.locallift.data.model.OrderEntity
import com.example.locallift.data.model.OrderItemEntity
import com.example.locallift.data.model.ProductEntity
import com.example.locallift.data.model.ReviewEntity
import com.example.locallift.data.model.VendorEntity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [
        VendorEntity::class,
        ProductEntity::class,
        OfferEntity::class,
        OrderEntity::class,
        OrderItemEntity::class,
        CartItemEntity::class,
        ReviewEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun localLiftDao(): LocalLiftDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context, scope: CoroutineScope): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "locallift_database"
                )
                    .fallbackToDestructiveMigration()
                    .addCallback(DatabaseCallback(scope))
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }

    private class DatabaseCallback(
        private val scope: CoroutineScope
    ) : RoomDatabase.Callback() {
        override fun onCreate(db: SupportSQLiteDatabase) {
            super.onCreate(db)
            INSTANCE?.let { database ->
                scope.launch(Dispatchers.IO) {
                    populateInitialData(database.localLiftDao())
                }
            }
        }

        private suspend fun populateInitialData(dao: LocalLiftDao) {
            dao.insertVendors(InitialDataSeeder.getInitialVendors())
            dao.insertProducts(InitialDataSeeder.getInitialProducts())
            dao.insertOffers(InitialDataSeeder.getInitialOffers())
            dao.insertReviews(InitialDataSeeder.getInitialReviews())
            val orders = InitialDataSeeder.getInitialOrders()
            for (order in orders) {
                dao.insertOrder(order)
            }
            dao.insertOrderItems(InitialDataSeeder.getInitialOrderItems())
        }
    }
}
