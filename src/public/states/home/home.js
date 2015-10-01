/**
 * @file Home Page
 * @author Thomas Ibarra <sparksd2145.dev@gmail.com>
 */
Bluebird.States['Home'] = {
    name: 'home',
    templateUrl: 'home/home',
    url: ['/', '/home', ''],
    controller: [
        '$scope',
        function($scope){

            /** Quotes for random quote display on home page, and their associated origins. */
            var quotes = [
                "Searching should always be this easy.", // Default quote
                "Great Scott!", // Back to the Future
                'An unusual game. The only winning search is not to struggle.', // WarGames -- http://www.imdb.com/title/tt0086567/
                "Searching whole countries with the cunning use of flags.", // Eddie Izzard, Dress to Kill
                Array(16).join(("piderman" - 1) + " ") + 'Searchman!', // https://www.destroyallsoftware.com/talks/wat
                "Make it search, Number One.", // Star Trek
                "Search into Maximum Overdrive.", // Spongebob Squarepants -- https://www.youtube.com/watch?v=zJFmeppMe6o
                "The following is classified, level Rho.", // Freespace 2 -- https://www.youtube.com/watch?v=NpuaiOyBW5c
                "The search is palpable. (famous last words)", // https://www.youtube.com/watch?v=8Ijmx3MH9_w
                "I was out of queries.", // Live Free or Die Hard "You just killed a helicopter with a car! I was out of bullets." -- https://www.youtube.com/watch?v=8YXi9JAgdf0
                "Come with me if you want to search.", // Terminator
                "Search up a Bluebird Special." // Nowhere really, just thought it sounded cool
            ];

            // Get a quote!
            var where = Math.floor(Math.random() * quotes.length);
            $scope.quote = quotes[where];
        }
    ]
};