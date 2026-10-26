import { useCallback, useEffect, useState } from 'react';
import { View, Pressable, Image, Alert } from 'react-native';
import { Text } from '@/components/Text';
import * as ImagePicker from 'expo-image-picker';
import { Upload, Trash2, Play, Newspaper } from 'lucide-react-native';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useTheme } from '@/context/ThemeContext';
import { useConfirm } from '@/hooks/useConfirm';
import { supabase } from '@/lib/supabase';
import { POST_CATEGORIES, categoryLabel, type PostCategory } from '@/data/postCategories';
import { uploadAssetToBucket } from '@/lib/upload';

type Post = { id: string; image_url: string; media_type: 'image' | 'video' | null; title: string | null; description: string | null; category: string | null };

export default function StaffBlog() {
  const { colors } = useTheme();
  const confirm = useConfirm();
  const [posts, setPosts] = useState<Post[]>([]);
  const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PostCategory>('other');
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from('gallery_photos').select('*').order('sort_order', { ascending: false });
    setPosts(data || []);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount, setState happens after the await
    load();
  }, [load]);

  async function pickMedia() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images', 'videos'], quality: 0.8 });
    if (!result.canceled) setAsset(result.assets[0]);
  }

  async function handlePublish() {
    if (!asset) return;
    setUploading(true);
    try {
      const isVideo = asset.type === 'video';
      const ext = isVideo ? 'mp4' : 'jpg';
      const { publicUrl, error } = await uploadAssetToBucket('gallery', asset.uri, ext, isVideo ? 'video/mp4' : 'image/jpeg');
      if (error || !publicUrl) {
        Alert.alert("Couldn't publish", error?.message ?? 'Unknown upload error.');
        setUploading(false);
        return;
      }
      const { error: insertError } = await supabase.from('gallery_photos').insert({
        image_url: publicUrl,
        title: title.trim() || null,
        description: description.trim() || null,
        media_type: isVideo ? 'video' : 'image',
        category,
        sort_order: Date.now(),
      });
      if (insertError) {
        Alert.alert("Uploaded, but couldn't save the post", insertError.message);
        setUploading(false);
        return;
      }
    } catch (err) {
      Alert.alert("Couldn't publish", err instanceof Error ? err.message : 'Unknown error.');
      setUploading(false);
      return;
    }
    setUploading(false);
    setAsset(null);
    setTitle('');
    setDescription('');
    load();
  }

  async function remove(id: string) {
    const ok = await confirm({ title: 'Delete this post?', message: 'It disappears from the Events blog immediately.' });
    if (!ok) return;
    await supabase.from('gallery_photos').delete().eq('id', id);
    load();
  }

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 2 }}>
        <Newspaper size={22} color={colors.accent} />
        <Text style={{ fontFamily: 'BebasNeue_400Regular', fontSize: 26, color: colors.ink }}>New post</Text>
      </View>
      <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 14 }}>
        Posts here show up on the &quot;Past events&quot; blog everyone sees under the Events tab.
      </Text>

      <Card style={{ marginBottom: 24, gap: 10 }}>
        <Pressable
          onPress={pickMedia}
          style={{ borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderStyle: asset ? 'solid' : 'dashed', borderColor: colors.border }}
        >
          {asset ? (
            <View>
              <Image source={{ uri: asset.uri }} style={{ width: '100%', height: 160 }} />
              {asset.type === 'video' && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center' }}>
                  <Play size={20} color="#fff" fill="#fff" />
                </View>
              )}
            </View>
          ) : (
            <View style={{ padding: 24, alignItems: 'center', gap: 8 }}>
              <Upload size={20} color={colors.accent} />
              <Text style={{ fontSize: 12, fontWeight: '500', color: colors.ink }}>Tap to choose a photo or video</Text>
            </View>
          )}
        </Pressable>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {POST_CATEGORIES.map((c) => {
            const active = category === c.value;
            return (
              <Pressable
                key={c.value}
                onPress={() => setCategory(c.value)}
                style={{ paddingVertical: 7, paddingHorizontal: 13, borderRadius: 18, borderWidth: 1, borderColor: active ? `${colors.accent}55` : colors.border, backgroundColor: active ? `${colors.accent}22` : colors.surface }}
              >
                <Text style={{ fontSize: 12, fontWeight: '500', color: active ? colors.accent : colors.muted }}>{c.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <TextField placeholder="Post title" value={title} onChangeText={setTitle} />
        <TextField placeholder="Caption (optional)" value={description} onChangeText={setDescription} multiline numberOfLines={2} style={{ minHeight: 56, textAlignVertical: 'top' }} />
        <Button label={uploading ? 'Publishing...' : 'Publish to blog'} onPress={handlePublish} loading={uploading} disabled={!asset} />
      </Card>

      <Text style={{ fontFamily: 'BebasNeue_400Regular', fontSize: 22, color: colors.ink, marginBottom: 12 }}>
        {posts.length} post{posts.length === 1 ? '' : 's'}
      </Text>
      <View style={{ gap: 12 }}>
        {posts.map((p) => (
          <Card key={p.id} style={{ padding: 0, overflow: 'hidden' }}>
            <View style={{ width: '100%', height: 140 }}>
              <Image source={{ uri: p.image_url }} style={{ width: '100%', height: '100%' }} />
              {p.media_type === 'video' && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' }}>
                  <Play size={16} color="#fff" fill="#fff" />
                </View>
              )}
            </View>
            <View style={{ padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.ink }} numberOfLines={1}>{p.title || 'Untitled post'}</Text>
                <Text style={{ fontSize: 11, color: colors.muted }} numberOfLines={1}>
                  {[categoryLabel(p.category), p.description].filter(Boolean).join(' · ')}
                </Text>
              </View>
              <Pressable onPress={() => remove(p.id)} style={{ paddingLeft: 12 }}>
                <Trash2 size={15} color={colors.danger} />
              </Pressable>
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
