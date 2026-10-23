import Button from '@/shared/components/Button';
import { colors, globalStyles } from '@/shared/global.styles';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function WelcomeScreen() {
  const { t, i18n } = useTranslation();
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 60 }}>
        <Image
          source={require('../../../../assets/images/map-placeholder.png')}
          style={style.mapImage}
        />
        <LinearGradient
          colors={[`${colors.background}00`, colors.background]}
          style={style.fade}
        />
        <View style={style.header}>
          <View style={style.brand}>
            <Image
              source={require('@/assets/logo.png')}
              style={style.logo}
            />
            <Text style={style.brandText}>MyRain365</Text>
          </View>

          <View style={style.languageButtons}>
            <Pressable 
              onPress={()=> i18n.changeLanguage("en")}
            >
              <Text style={[style.languageButtonText, i18n.language === 'en' && style.activeLanguage]}>EN</Text>
            </Pressable>
            <Pressable 
              onPress={()=>i18n.changeLanguage("fr")}
            >
              <Text style={[style.languageButtonText, i18n.language==='fr'&& style.activeLanguage]}>FR</Text>
            </Pressable>
          </View>
        </View>
      </View>
      <View style={[style.card, { flex: 40 }]}>
        <View>
          <Text style={[globalStyles.title, style.title]}>{t("welcome.title")}</Text>
          <Text style={[globalStyles.sectionTitle, style.sectionTitle]}>{t("welcome.subtitle")}</Text>
        </View>
        <View>
          <Button
            label={t("welcome.findBuilding")}
            variant='primary'
            onPress={() => (console.log("1st Button Pressed"))}
            showArrow={true}
          />
          <Button
            label={t("welcome.manageSite")}
            variant={'secondary'}
            onPress={() => (console.log("2nd Button Pressed"))}
          />
        </View>
      </View>
    </View>

  )

}

const style = StyleSheet.create({
  mapImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover"
  },
  card: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#245581',
  },
  languageButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#eeeae2',
    padding: 4,
    borderRadius: 25,
  },
  languageButtonText: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  title: {
    marginTop: 30,
    textAlign: "justify",
    fontSize: 30,
  },
  sectionTitle: {
    marginTop: 10,
    textAlign: "justify",
  },
  activeLanguage: {
    backgroundColor: '#245581',
    color: 'white',
  },
  fade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
  },
})