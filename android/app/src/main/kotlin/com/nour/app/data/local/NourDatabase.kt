package com.nour.app.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.nour.app.data.local.dao.*
import com.nour.app.data.local.entity.*
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Database(
    entities = [
        UserEntity::class,
        ContentItemEntity::class,
        ExamEntity::class,
        ExamSubmissionEntity::class,
        NotificationEntity::class
    ],
    version = 1,
    exportSchema = true
)
abstract class NourDatabase : RoomDatabase() {
    abstract fun contentDao(): ContentDao
    abstract fun examDao(): ExamDao
    abstract fun notificationDao(): NotificationDao
    abstract fun userDao(): UserDao
}

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideNourDatabase(@ApplicationContext context: Context): NourDatabase {
        return Room.databaseBuilder(
            context,
            NourDatabase::class.java,
            "nour_database"
        )
            .fallbackToDestructiveMigration()   // For MVP; use proper migrations in production
            .build()
    }

    @Provides fun provideContentDao(db: NourDatabase): ContentDao = db.contentDao()
    @Provides fun provideExamDao(db: NourDatabase): ExamDao = db.examDao()
    @Provides fun provideNotificationDao(db: NourDatabase): NotificationDao = db.notificationDao()
    @Provides fun provideUserDao(db: NourDatabase): UserDao = db.userDao()
}
