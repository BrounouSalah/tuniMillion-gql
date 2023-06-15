db.createUser(
    {
        user: "root",
        pwd: "exemple",
        roles: [
            {
                role: "readWrite",
                db: "Tunimillion"
            }
        ]
    }
);