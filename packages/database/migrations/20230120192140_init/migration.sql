-- CreateEnum
CREATE TYPE "Privacy" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "registrationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "privacy" "Privacy" NOT NULL DEFAULT 'PUBLIC',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follows" (
    "id" SERIAL NOT NULL,
    "followerId" TEXT NOT NULL,
    "followeeId" TEXT NOT NULL,

    CONSTRAINT "Follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "History" (
    "id" SERIAL NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL,
    "trackId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "History_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Track" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "releaseDate" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,
    "imagesId" INTEGER NOT NULL,
    "featuresId" INTEGER NOT NULL,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Album" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "releaseDate" TEXT NOT NULL,
    "totalTracks" INTEGER NOT NULL,
    "imagesId" INTEGER NOT NULL,
    "featuresId" INTEGER NOT NULL,

    CONSTRAINT "Album_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "followers" INTEGER NOT NULL,
    "imagesId" INTEGER NOT NULL,
    "featuresId" INTEGER NOT NULL,

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Images" (
    "id" SERIAL NOT NULL,
    "high" TEXT NOT NULL,
    "medium" TEXT NOT NULL,
    "low" TEXT NOT NULL,

    CONSTRAINT "Images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudioFeatures" (
    "id" SERIAL NOT NULL,
    "tempo" INTEGER NOT NULL,
    "energy" INTEGER NOT NULL,
    "loudness" INTEGER NOT NULL,
    "dancebility" INTEGER NOT NULL,
    "instrumentalness" INTEGER NOT NULL,
    "acousticness" INTEGER NOT NULL,
    "speechiness" INTEGER NOT NULL,
    "popularity" INTEGER NOT NULL,
    "liveness" INTEGER NOT NULL,
    "valence" INTEGER NOT NULL,

    CONSTRAINT "AudioFeatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Genre" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AlbumToGenre" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ArtistToGenre" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ArtistToTrack" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Track_imagesId_key" ON "Track"("imagesId");

-- CreateIndex
CREATE UNIQUE INDEX "Track_featuresId_key" ON "Track"("featuresId");

-- CreateIndex
CREATE UNIQUE INDEX "Album_imagesId_key" ON "Album"("imagesId");

-- CreateIndex
CREATE UNIQUE INDEX "Album_featuresId_key" ON "Album"("featuresId");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_imagesId_key" ON "Artist"("imagesId");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_featuresId_key" ON "Artist"("featuresId");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_name_key" ON "Genre"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_AlbumToGenre_AB_unique" ON "_AlbumToGenre"("A", "B");

-- CreateIndex
CREATE INDEX "_AlbumToGenre_B_index" ON "_AlbumToGenre"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ArtistToGenre_AB_unique" ON "_ArtistToGenre"("A", "B");

-- CreateIndex
CREATE INDEX "_ArtistToGenre_B_index" ON "_ArtistToGenre"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ArtistToTrack_AB_unique" ON "_ArtistToTrack"("A", "B");

-- CreateIndex
CREATE INDEX "_ArtistToTrack_B_index" ON "_ArtistToTrack"("B");

-- AddForeignKey
ALTER TABLE "Follows" ADD CONSTRAINT "Follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follows" ADD CONSTRAINT "Follows_followeeId_fkey" FOREIGN KEY ("followeeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_imagesId_fkey" FOREIGN KEY ("imagesId") REFERENCES "Images"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_featuresId_fkey" FOREIGN KEY ("featuresId") REFERENCES "AudioFeatures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Album" ADD CONSTRAINT "Album_imagesId_fkey" FOREIGN KEY ("imagesId") REFERENCES "Images"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Album" ADD CONSTRAINT "Album_featuresId_fkey" FOREIGN KEY ("featuresId") REFERENCES "AudioFeatures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artist" ADD CONSTRAINT "Artist_imagesId_fkey" FOREIGN KEY ("imagesId") REFERENCES "Images"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artist" ADD CONSTRAINT "Artist_featuresId_fkey" FOREIGN KEY ("featuresId") REFERENCES "AudioFeatures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlbumToGenre" ADD CONSTRAINT "_AlbumToGenre_A_fkey" FOREIGN KEY ("A") REFERENCES "Album"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlbumToGenre" ADD CONSTRAINT "_AlbumToGenre_B_fkey" FOREIGN KEY ("B") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtistToGenre" ADD CONSTRAINT "_ArtistToGenre_A_fkey" FOREIGN KEY ("A") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtistToGenre" ADD CONSTRAINT "_ArtistToGenre_B_fkey" FOREIGN KEY ("B") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtistToTrack" ADD CONSTRAINT "_ArtistToTrack_A_fkey" FOREIGN KEY ("A") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtistToTrack" ADD CONSTRAINT "_ArtistToTrack_B_fkey" FOREIGN KEY ("B") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;
