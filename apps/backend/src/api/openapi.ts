export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Circles API",
    version: "1.0.0",
    description:
      "Circles backend API. Protected routes require a Better Auth OAuth access token in the Authorization header.",
  },
  servers: [{ url: "/" }],
  tags: [
    { name: "System" },
    { name: "Me" },
    { name: "Users" },
    { name: "Social" },
    { name: "Library" },
    { name: "Playlists" },
    { name: "Import" },
  ],
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        description: "Simple liveness check for the backend.",
        tags: ["System"],
        responses: {
          200: {
            description: "Backend is healthy.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                  },
                  required: ["status"],
                },
              },
            },
          },
        },
      },
    },
    "/leaderboard": {
      get: {
        summary: "Get leaderboard",
        description: "Returns the public stream leaderboard.",
        tags: ["Social"],
        parameters: [
          {
            in: "query",
            name: "period",
            schema: {
              type: "string",
              enum: ["week", "all"],
              default: "all",
            },
            description: "Leaderboard period.",
          },
        ],
        responses: {
          200: {
            description: "Leaderboard entries.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    leaderboard: {
                      type: "array",
                      items: { $ref: "#/components/schemas/LeaderboardEntry" },
                    },
                  },
                  required: ["leaderboard"],
                },
              },
            },
          },
        },
      },
    },
    "/me": {
      get: {
        summary: "Get current user",
        description: "Returns the authenticated user's public profile fields.",
        tags: ["Me"],
        responses: {
          200: {
            description: "Authenticated user profile.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CurrentUser" },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        summary: "Delete current account",
        description: "Permanently deletes the authenticated user and their Circles data.",
        tags: ["Me"],
        responses: {
          200: {
            description: "Account deleted.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { ok: { type: "boolean", example: true } },
                  required: ["ok"],
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/me/history": {
      get: {
        summary: "Get listening history",
        description: "Returns a cursor-based page of the current user's history.",
        tags: ["Me"],
        parameters: [
          { $ref: "#/components/parameters/limit1to200" },
          { $ref: "#/components/parameters/beforeDateTime" },
          { $ref: "#/components/parameters/afterDateTime" },
        ],
        responses: {
          200: {
            description: "History page.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HistoryPage" },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/me/stats": {
      get: {
        summary: "Get top tracks and artists",
        description: "Returns top tracks and artists for a selected time range.",
        tags: ["Me"],
        parameters: [{ $ref: "#/components/parameters/range" }],
        responses: {
          200: {
            description: "Top tracks and artists.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    topTracks: { type: "array", items: {} },
                    topArtists: { type: "array", items: {} },
                  },
                  required: ["topTracks", "topArtists"],
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/me/stats/extended": {
      get: {
        summary: "Get extended stats",
        description: "Returns extended aggregate stats for the authenticated user.",
        tags: ["Me"],
        parameters: [{ $ref: "#/components/parameters/range" }],
        responses: {
          200: {
            description: "Extended stats object.",
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/me/time-machine": {
      get: {
        summary: "Get time machine",
        description: "Returns what the user listened to on a given month/day.",
        tags: ["Me"],
        parameters: [
          {
            in: "query",
            name: "month",
            required: true,
            schema: { type: "integer", minimum: 1, maximum: 12 },
          },
          {
            in: "query",
            name: "day",
            required: true,
            schema: { type: "integer", minimum: 1, maximum: 31 },
          },
        ],
        responses: {
          200: {
            description: "Time machine results.",
            content: {
              "application/json": {
                schema: { type: "array", items: {} },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/users/by-username/{username}": {
      get: {
        summary: "Get public user by username",
        description: "Returns a public user profile by username.",
        tags: ["Users"],
        parameters: [
          {
            in: "path",
            name: "username",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Public user profile.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PublicUser" },
              },
            },
          },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/users/{id}": {
      get: {
        summary: "Get public user by id",
        description: "Returns a public user profile by internal user id.",
        tags: ["Users"],
        parameters: [{ $ref: "#/components/parameters/userIdPath" }],
        responses: {
          200: {
            description: "Public user profile.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PublicUser" },
              },
            },
          },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/users/{id}/stats": {
      get: {
        summary: "Get public user top music",
        description:
          "Returns top tracks, artists, and albums for a public user and selected time range.",
        tags: ["Users"],
        parameters: [
          { $ref: "#/components/parameters/userIdPath" },
          { $ref: "#/components/parameters/range" },
        ],
        responses: {
          200: {
            description: "Top tracks, artists, and albums.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    topTracks: { type: "array", items: {} },
                    topArtists: { type: "array", items: {} },
                    topAlbums: { type: "array", items: {} },
                  },
                  required: ["topTracks", "topArtists", "topAlbums"],
                },
              },
            },
          },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/users/{id}/stats/extended": {
      get: {
        summary: "Get public user extended stats",
        description: "Returns extended stats for a public user.",
        tags: ["Users"],
        parameters: [
          { $ref: "#/components/parameters/userIdPath" },
          { $ref: "#/components/parameters/range" },
        ],
        responses: {
          200: {
            description: "Extended stats object.",
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
            },
          },
          403: { $ref: "#/components/responses/Forbidden" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/me/follows/{userId}": {
      post: {
        summary: "Follow user",
        description: "Follows another user.",
        tags: ["Social"],
        parameters: [{ $ref: "#/components/parameters/userIdPath" }],
        responses: {
          200: { $ref: "#/components/responses/Ok" },
          400: { $ref: "#/components/responses/BadRequest" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        summary: "Unfollow user",
        description: "Unfollows a previously followed user.",
        tags: ["Social"],
        parameters: [{ $ref: "#/components/parameters/userIdPath" }],
        responses: {
          200: { $ref: "#/components/responses/Ok" },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/me/follows": {
      get: {
        summary: "Get follows",
        description: "Returns both following and followers for the current user.",
        tags: ["Social"],
        responses: {
          200: {
            description: "Followers and following.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    following: { type: "array", items: {} },
                    followers: { type: "array", items: {} },
                  },
                  required: ["following", "followers"],
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/me/following-activity": {
      get: {
        summary: "Get following activity",
        description: "Returns recent listening activity from followed users.",
        tags: ["Social"],
        responses: {
          200: {
            description: "Recent plays by followed users.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    plays: { type: "array", items: {} },
                  },
                  required: ["plays"],
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/me/music-matches": {
      get: {
        summary: "Get music matches",
        description: "Returns public users with overlapping top artists.",
        tags: ["Social"],
        responses: {
          200: {
            description: "Matched users.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    matches: { type: "array", items: {} },
                  },
                  required: ["matches"],
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/me/playlists": {
      get: {
        summary: "List playlists",
        description: "Returns the authenticated user's playlists.",
        tags: ["Playlists"],
        responses: {
          200: {
            description: "Playlists list.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    playlists: { type: "array", items: {} },
                  },
                  required: ["playlists"],
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
      post: {
        summary: "Create playlist",
        description: "Creates a new playlist for the authenticated user.",
        tags: ["Playlists"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", minLength: 1, maxLength: 500 },
                  description: { type: "string" },
                },
                required: ["name"],
              },
            },
          },
        },
        responses: {
          201: {
            description: "Created playlist.",
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/me/playlists/{id}": {
      delete: {
        summary: "Delete playlist",
        description: "Deletes a playlist owned by the authenticated user.",
        tags: ["Playlists"],
        parameters: [{ $ref: "#/components/parameters/idPath" }],
        responses: {
          200: { $ref: "#/components/responses/Ok" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/me/playlists/{id}/tracks": {
      get: {
        summary: "List playlist tracks",
        description: "Returns tracks from a playlist owned by the current user.",
        tags: ["Playlists"],
        parameters: [{ $ref: "#/components/parameters/idPath" }],
        responses: {
          200: {
            description: "Playlist tracks.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    tracks: { type: "array", items: {} },
                  },
                  required: ["tracks"],
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
      post: {
        summary: "Add track to playlist",
        description: "Adds a track to a playlist, optionally at a specific position.",
        tags: ["Playlists"],
        parameters: [{ $ref: "#/components/parameters/idPath" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  trackId: { type: "string" },
                  position: { type: "number" },
                },
                required: ["trackId"],
              },
            },
          },
        },
        responses: {
          201: { $ref: "#/components/responses/Ok" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/me/playlists/{id}/tracks/{trackId}": {
      delete: {
        summary: "Remove track from playlist",
        description: "Removes a track from a playlist owned by the authenticated user.",
        tags: ["Playlists"],
        parameters: [
          { $ref: "#/components/parameters/idPath" },
          {
            in: "path",
            name: "trackId",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { $ref: "#/components/responses/Ok" },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/library/overview": {
      get: {
        summary: "Get library overview",
        description: "Returns high-level library aggregates for a time range.",
        tags: ["Library"],
        parameters: [{ $ref: "#/components/parameters/range" }],
        responses: {
          200: {
            description: "Library overview.",
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/library/scrobbles": {
      get: {
        summary: "List library streams",
        description: "Returns paginated streams for the current user.",
        tags: ["Library"],
        parameters: [
          { $ref: "#/components/parameters/range" },
          { $ref: "#/components/parameters/limit1to100" },
          {
            in: "query",
            name: "cursor",
            schema: { type: "string", format: "date-time" },
          },
        ],
        responses: {
          200: {
            description: "Streams page.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    items: { type: "array", items: {} },
                    totalCount: { type: "number" },
                    hasMore: { type: "boolean" },
                    nextCursor: {
                      oneOf: [{ type: "string", format: "date-time" }, { type: "null" }],
                    },
                  },
                  required: ["items", "totalCount", "hasMore", "nextCursor"],
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/library/artists": {
      get: {
        summary: "List library artists",
        description: "Returns paginated artists ranked by play count.",
        tags: ["Library"],
        parameters: [
          { $ref: "#/components/parameters/range" },
          { $ref: "#/components/parameters/limit1to100" },
          {
            in: "query",
            name: "cursorPlayCount",
            schema: { type: "number" },
          },
          {
            in: "query",
            name: "cursorId",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Artists page.",
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/library/albums": {
      get: {
        summary: "List library albums",
        description: "Returns paginated albums ranked by play count.",
        tags: ["Library"],
        parameters: [
          { $ref: "#/components/parameters/range" },
          { $ref: "#/components/parameters/limit1to100" },
          {
            in: "query",
            name: "cursorPlayCount",
            schema: { type: "number" },
          },
          {
            in: "query",
            name: "cursorId",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Albums page.",
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/library/tracks": {
      get: {
        summary: "List library tracks",
        description: "Returns paginated tracks ranked by play count.",
        tags: ["Library"],
        parameters: [
          { $ref: "#/components/parameters/range" },
          { $ref: "#/components/parameters/limit1to100" },
          {
            in: "query",
            name: "cursorPlayCount",
            schema: { type: "number" },
          },
          {
            in: "query",
            name: "cursorId",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Tracks page.",
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/artists/{id}": {
      get: {
        summary: "Get artist detail",
        description:
          "Returns artist detail for the authenticated user and may enqueue hydration if metadata is missing.",
        tags: ["Library"],
        parameters: [
          { $ref: "#/components/parameters/idPath" },
          { $ref: "#/components/parameters/range" },
        ],
        responses: {
          200: {
            description: "Artist detail.",
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/albums/{id}": {
      get: {
        summary: "Get album detail",
        description: "Returns album detail for the authenticated user.",
        tags: ["Library"],
        parameters: [
          { $ref: "#/components/parameters/idPath" },
          { $ref: "#/components/parameters/range" },
        ],
        responses: {
          200: {
            description: "Album detail.",
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/tracks/{id}": {
      get: {
        summary: "Get track detail",
        description: "Returns track detail for the authenticated user.",
        tags: ["Library"],
        parameters: [
          { $ref: "#/components/parameters/idPath" },
          { $ref: "#/components/parameters/range" },
        ],
        responses: {
          200: {
            description: "Track detail.",
            content: {
              "application/json": {
                schema: { type: "object", additionalProperties: true },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
          404: { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/me/import/upload": {
      post: {
        summary: "Create import upload URL",
        description: "Creates a signed S3 upload URL for a new import file.",
        tags: ["Import"],
        responses: {
          200: {
            description: "Signed upload target.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    uploadUrl: { type: "string", format: "uri" },
                    s3Key: { type: "string" },
                  },
                  required: ["uploadUrl", "s3Key"],
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/me/import/process": {
      post: {
        summary: "Start import processing",
        description: "Creates an import job and enqueues processing.",
        tags: ["Import"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  s3Key: { type: "string" },
                },
                required: ["s3Key"],
              },
            },
          },
        },
        responses: {
          201: {
            description: "Import job created.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    jobId: { type: "string" },
                  },
                  required: ["jobId"],
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/me/import/status": {
      get: {
        summary: "Get latest import status",
        description: "Returns the latest import job for the current user, or null if none exist.",
        tags: ["Import"],
        responses: {
          200: {
            description: "Latest import job or null.",
            content: {
              "application/json": {
                schema: {
                  oneOf: [{ $ref: "#/components/schemas/ImportStatus" }, { type: "null" }],
                },
              },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
  },
  components: {
    parameters: {
      idPath: {
        in: "path",
        name: "id",
        required: true,
        schema: { type: "string" },
      },
      userIdPath: {
        in: "path",
        name: "userId",
        required: true,
        schema: { type: "string" },
      },
      range: {
        in: "query",
        name: "range",
        schema: {
          type: "string",
          enum: ["7d", "30d", "90d", "365d", "all"],
          default: "all",
        },
      },
      limit1to100: {
        in: "query",
        name: "limit",
        schema: {
          type: "integer",
          minimum: 1,
          maximum: 100,
          default: 50,
        },
      },
      limit1to200: {
        in: "query",
        name: "limit",
        schema: {
          type: "integer",
          minimum: 1,
          maximum: 200,
          default: 50,
        },
      },
      beforeDateTime: {
        in: "query",
        name: "before",
        schema: { type: "string", format: "date-time" },
      },
      afterDateTime: {
        in: "query",
        name: "after",
        schema: { type: "string", format: "date-time" },
      },
    },
    responses: {
      Ok: {
        description: "Operation completed successfully.",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                ok: { type: "boolean", example: true },
              },
              required: ["ok"],
            },
          },
        },
      },
      BadRequest: {
        description: "Request validation failed or business rule rejected the request.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      Unauthorized: {
        description: "Missing or invalid authenticated session.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      Forbidden: {
        description: "The target resource is not accessible.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      NotFound: {
        description: "The requested resource does not exist.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      InternalError: {
        description: "The backend failed to complete the request.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string" },
          message: { type: "string" },
        },
        additionalProperties: true,
      },
      CurrentUser: {
        type: "object",
        properties: {
          id: { type: "string" },
          spotifyId: { type: "string" },
          displayName: { type: "string" },
          email: { type: "string", nullable: true },
          avatarUrl: { type: "string", nullable: true },
          username: { type: "string", nullable: true },
          isPublic: { type: "boolean" },
          bio: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
        required: [
          "id",
          "spotifyId",
          "displayName",
          "email",
          "avatarUrl",
          "username",
          "isPublic",
          "bio",
          "createdAt",
        ],
      },
      PublicUser: {
        type: "object",
        properties: {
          id: { type: "string" },
          displayName: { type: "string" },
          username: { type: "string", nullable: true },
          avatarUrl: { type: "string", nullable: true },
          bio: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
        required: ["id", "displayName", "username", "avatarUrl", "bio", "createdAt"],
      },
      LeaderboardEntry: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          username: { type: "string", nullable: true },
          image: { type: "string", nullable: true },
          scrobbleCount: { type: "number" },
        },
        required: ["id", "name", "username", "image", "scrobbleCount"],
      },
      HistoryPage: {
        type: "object",
        properties: {
          items: { type: "array", items: {} },
          hasMore: { type: "boolean" },
          nextCursor: {
            oneOf: [{ type: "string", format: "date-time" }, { type: "null" }],
          },
        },
        required: ["items", "hasMore", "nextCursor"],
      },
      ImportStatus: {
        type: "object",
        properties: {
          id: { type: "string" },
          status: { type: "string" },
          totalTracks: { type: "number", nullable: true },
          importedTracks: { type: "number", nullable: true },
          errorMessage: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          completedAt: {
            oneOf: [{ type: "string", format: "date-time" }, { type: "null" }],
          },
        },
        required: [
          "id",
          "status",
          "totalTracks",
          "importedTracks",
          "errorMessage",
          "createdAt",
          "completedAt",
        ],
      },
    },
  },
} as const;
