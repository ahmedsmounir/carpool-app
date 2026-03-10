import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../ThemeContext';
import { getWallet } from '../api';
import { useFocusEffect } from '@react-navigation/native';

export default function WalletScreen({ currentUser }) {
  const { colors } = useTheme();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const res = await getWallet(currentUser._id);
      if (res.error) throw new Error(res.error);
      setBalance(res.balance);
      setTransactions(res.transactions);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchWallet();
    }, [])
  );

  const renderTransaction = ({ item }) => {
    const isSender = item.sender_id === currentUser._id;
    const sign = isSender ? '-' : '+';
    const amountColor = isSender ? '#dc3545' : '#28a745';

    // Description logic
    let description = '';
    if (isSender) {
      description = `Paid to ${item.receiver_name}`;
    } else {
      description = `Received from ${item.sender_name}`;
    }

    const date = new Date(item.timestamp).toLocaleString();

    return (
      <View style={[styles.transactionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.transactionInfo}>
          <Text style={[styles.transactionDesc, { color: colors.text }]}>{description}</Text>
          <Text style={[styles.transactionDate, { color: colors.textMuted }]}>{date}</Text>
        </View>
        <Text style={[styles.transactionAmount, { color: amountColor }]}>
          {sign}${item.amount.toFixed(2)}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
        <Text style={[styles.balanceLabel, { color: colors.primaryText }]}>Current Balance</Text>
        <Text style={[styles.balanceAmount, { color: colors.primaryText }]}>${balance?.toFixed(2) || '0.00'}</Text>
      </View>

      <Text style={[styles.historyTitle, { color: colors.text }]}>Transaction History</Text>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTransaction}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No transactions yet.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCard: {
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    opacity: 0.9,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: '800',
  },
  historyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 15,
  },
  listContainer: {
    paddingBottom: 40,
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDesc: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontStyle: 'italic',
  }
});
