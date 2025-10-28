import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Game, Player, Round, WORD_PAIRS } from '../types';

export const useGame = (gameId: string | null) => {
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gameId) {
      setLoading(false);
      return;
    }

    let isSubscribed = true;

    const fetchGameData = async () => {
      try {
        // Fetch game data
        const { data: gameData, error: gameError } = await supabase
          .from('games')
          .select('*')
          .eq('id', gameId)
          .single();

        if (gameError) {
          console.error('Error fetching game:', gameError);
          setLoading(false);
          return;
        }

        if (isSubscribed && gameData) {
          setGame(gameData);

          // Fetch players
          const { data: playersData, error: playersError } = await supabase
            .from('players')
            .select('*')
            .eq('game_id', gameId)
            .order('player_number');

          if (playersError) {
            console.error('Error fetching players:', playersError);
          } else if (isSubscribed) {
            setPlayers(playersData || []);
          }

          // Fetch current round if game is playing
          if (gameData.current_round > 0) {
            const { data: roundData, error: roundError } = await supabase
              .from('rounds')
              .select('*')
              .eq('game_id', gameId)
              .eq('round_number', gameData.current_round)
              .single();

            if (roundError) {
              console.error('Error fetching round:', roundError);
            } else if (isSubscribed) {
              setCurrentRound(roundData);
            }
          }
        }

        if (isSubscribed) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in fetchGameData:', error);
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchGameData();

    // Set up real-time subscriptions
    const gameChannel = supabase
      .channel(`game-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`
        },
        (payload) => {
          console.log('Game update:', payload);
          if (payload.new && isSubscribed) {
            setGame(payload.new as Game);
            
            // Fetch current round when game updates
            const newGame = payload.new as Game;
            if (newGame.current_round > 0) {
              supabase
                .from('rounds')
                .select('*')
                .eq('game_id', gameId)
                .eq('round_number', newGame.current_round)
                .single()
                .then(({ data }) => {
                  if (data && isSubscribed) {
                    setCurrentRound(data);
                  }
                });
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `game_id=eq.${gameId}`
        },
        () => {
          console.log('Players update');
          // Refetch all players when any player changes
          supabase
            .from('players')
            .select('*')
            .eq('game_id', gameId)
            .order('player_number')
            .then(({ data }) => {
              if (data && isSubscribed) {
                setPlayers(data);
              }
            });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rounds',
          filter: `game_id=eq.${gameId}`
        },
        (payload) => {
          console.log('Round update:', payload);
          if (payload.new && isSubscribed) {
            const round = payload.new as Round;
            // Only update if it's the current round
            setCurrentRound((prev) => {
              if (!prev || round.round_number === prev.round_number) {
                return round;
              }
              return prev;
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      isSubscribed = false;
      gameChannel.unsubscribe();
    };
  }, [gameId]);

  return { game, players, currentRound, loading };
};

export const createGame = async (playerName: string): Promise<{ gameId: string; roomCode: string; playerId: string }> => {
  const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  const { data: gameData, error: gameError } = await supabase
    .from('games')
    .insert({ room_code: roomCode, status: 'waiting', current_round: 0 })
    .select()
    .single();

  if (gameError || !gameData) {
    throw new Error('Failed to create game');
  }

  const { data: playerData, error: playerError } = await supabase
    .from('players')
    .insert({ game_id: gameData.id, player_number: 1, name: playerName, score: 0 })
    .select()
    .single();

  if (playerError || !playerData) {
    throw new Error('Failed to create player');
  }

  return { gameId: gameData.id, roomCode: gameData.room_code, playerId: playerData.id };
};

export const joinGame = async (roomCode: string, playerName: string): Promise<{ gameId: string; playerId: string }> => {
  const { data: gameData, error: gameError } = await supabase
    .from('games')
    .select('*')
    .eq('room_code', roomCode.toUpperCase())
    .single();

  if (gameError || !gameData) {
    throw new Error('Game not found');
  }

  const { data: existingPlayers } = await supabase
    .from('players')
    .select('*')
    .eq('game_id', gameData.id);

  if (existingPlayers && existingPlayers.length >= 2) {
    throw new Error('Game is full');
  }

  const { data: playerData, error: playerError } = await supabase
    .from('players')
    .insert({ game_id: gameData.id, player_number: 2, name: playerName, score: 0 })
    .select()
    .single();

  if (playerError || !playerData) {
    throw new Error('Failed to join game');
  }

  // Update game status to playing and start first round
  await supabase
    .from('games')
    .update({ status: 'playing', current_round: 1, updated_at: new Date().toISOString() })
    .eq('id', gameData.id);

  const firstWord = WORD_PAIRS[0];
  await supabase
    .from('rounds')
    .insert({
      game_id: gameData.id,
      round_number: 1,
      word: firstWord.word
    });

  return { gameId: gameData.id, playerId: playerData.id };
};

export const submitChoice = async (gameId: string, playerId: string, choice: string): Promise<void> => {
  const { data: player } = await supabase
    .from('players')
    .select('*')
    .eq('id', playerId)
    .single();

  if (!player) throw new Error('Player not found');

  const { data: game } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single();

  if (!game) throw new Error('Game not found');

  const columnName = player.player_number === 1 ? 'player1_choice' : 'player2_choice';

  await supabase
    .from('rounds')
    .update({ [columnName]: choice })
    .eq('game_id', gameId)
    .eq('round_number', game.current_round);

  const { data: updatedRound } = await supabase
    .from('rounds')
    .select('*')
    .eq('game_id', gameId)
    .eq('round_number', game.current_round)
    .single();

  if (updatedRound && updatedRound.player1_choice && updatedRound.player2_choice) {
    const isMatch = updatedRound.player1_choice === updatedRound.player2_choice;

    await supabase
      .from('rounds')
      .update({ is_match: isMatch })
      .eq('id', updatedRound.id);

    if (isMatch) {
      const { data: players } = await supabase
        .from('players')
        .select('*')
        .eq('game_id', gameId);

      if (players) {
        for (const p of players) {
          await supabase
            .from('players')
            .update({ score: p.score + 1 })
            .eq('id', p.id);
        }
      }
    }

    setTimeout(async () => {
      if (game.current_round < 10) {
        const nextRound = game.current_round + 1;
        await supabase
          .from('games')
          .update({ current_round: nextRound, updated_at: new Date().toISOString() })
          .eq('id', gameId);

        const nextWord = WORD_PAIRS[nextRound - 1];
        await supabase
          .from('rounds')
          .insert({
            game_id: gameId,
            round_number: nextRound,
            word: nextWord.word
          });
      } else {
        await supabase
          .from('games')
          .update({ status: 'finished', updated_at: new Date().toISOString() })
          .eq('id', gameId);
      }
    }, 3000);
  }
};