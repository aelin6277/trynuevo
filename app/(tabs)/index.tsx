import React, { useState, useEffect, ReactNode } from 'react';
import { ScrollView, StyleSheet, Image, TouchableOpacity, Linking, ActivityIndicator, View, Text, TextStyle, ViewStyle } from 'react-native';
import { API_KEY } from '../../config';

// Typ för nyhetsartiklar
type NewsArticle = {
  title: string;
  description: string;
  urlToImage: string;
  url: string;
};

// Typ för textkomponenten, där `type` är valfritt
type ThemedTextProps = {
  type?: 'title' | 'subtitle' | 'defaultSemiBold'; // Gör type valfri
  style?: TextStyle;
  children: ReactNode;
};

// Anpassad Text-komponent för tematisk texttyp
const ThemedText: React.FC<ThemedTextProps> = ({ type = 'defaultSemiBold', style, children }) => {
  const textStyles = [styles[type], style];
  return <Text style={textStyles}>{children}</Text>;
};

// Typ för View-komponenten
type ThemedViewProps = {
  style?: ViewStyle;
  children: ReactNode;
};

// Anpassad View-komponent för teman
const ThemedView: React.FC<ThemedViewProps> = ({ style, children }) => {
  return <View style={[{ padding: 16, backgroundColor: '#f8f9fa' }, style]}>{children}</View>;
};

const NewsScreen: React.FC = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNews = async (pageNumber: number) => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}&page=${pageNumber}&pageSize=10`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.articles && data.articles.length > 0) {
        setNews(prevNews => [...prevNews, ...data.articles]);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching news", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(page);
  }, [page]);

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

    if (isCloseToBottom && hasMore && !loading) {
      setPage(prevPage => prevPage + 1);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      <Image source={{ uri: 'https://example.com/header-image.png' }} style={styles.headerImage} />

      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome to My News App!</ThemedText>
      </ThemedView>

      {news.map((item, index) => (
        <ThemedView key={index} style={styles.newsItem}>
          {item.urlToImage && (
            <Image source={{ uri: item.urlToImage }} style={styles.image} />
          )}
          <ThemedText type="subtitle">{item.title}</ThemedText>
          <ThemedText>{item.description}</ThemedText>
          <TouchableOpacity onPress={() => Linking.openURL(item.url)}>
            <ThemedText style={styles.readMore}>Read Article</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ))}
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent: { paddingVertical: 20 },
  titleContainer: { alignItems: 'center', marginVertical: 16 },
  headerImage: { width: '100%', height: 200, resizeMode: 'cover' },
  newsItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: 10 },
  image: { width: '100%', height: 200, marginBottom: 10 },
  readMore: { color: '#007bff', marginTop: 10 },

  // Stilar för ThemedText-komponenten
  title: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 18, fontWeight: '500', color: '#555' },
  defaultSemiBold: { fontSize: 16, fontWeight: '600', color: '#666' },
});

export default NewsScreen;
